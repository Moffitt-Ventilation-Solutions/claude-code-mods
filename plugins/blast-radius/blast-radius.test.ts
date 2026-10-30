// Tests for Moffitt's Windows changes to blast-radius (0.1.1). Run: claude plugin test plugins/blast-radius
import { expect, test } from 'claude-code/testing'

const GIT_BASH = 'C:/Program Files/Git/bin/bash.exe'

// Windows as Git for Windows leaves it: no bash or sleep on PATH, both under Git's root.
function windows(on: Parameters<Parameters<typeof test>[1]>[1], bash: (script: string, args: string[]) => string) {
  const ran: string[][] = []
  on('session.cwd', () => ({ value: 'C:/repo' }))
  on('session.surfaces', () => ({ value: [] }))
  on('clock.now', () => ({ value: 0 }))
  on('process.run', (_, e) => {
    ran.push([...e.argv])
    const [cmd, ...args] = e.argv
    if (cmd === 'sleep') return { deny: 'ENOENT: sleep is not on PATH' }
    if (cmd === 'git' && args[0] === '--exec-path') {
      return { value: { exitCode: 0, stdout: 'C:/Program Files/Git/ucrt64/libexec/git-core\n', stderr: '' } }
    }
    if (cmd === 'C:/Program Files/Git/usr/bin/sleep.exe') return { value: { exitCode: 0, stdout: '', stderr: '' } }
    if (cmd === GIT_BASH) return { value: { exitCode: 0, stdout: bash(args[1], args.slice(3)), stderr: '' } }
    return { deny: `unexpected command ${cmd}` }
  })
  on('tool.call', () => ({ result: {} }))
  return ran
}

test('on Windows, bash comes from Git for Windows and an unattended session is refused at once', async ($, on) => {
  const ran = windows(on, () => '3 3072 1\n./x/a.txt\n./x/b.txt\n./x/c.txt\n')

  const result = await $.tool.call({ tool: 'Bash', command: 'rm -rf ./x' })

  expect(result.deny).toContain('nobody is attached to this session to press Proceed')
  expect(result.deny).toContain('delete 3 files (about 3.0 KB)')
  expect(ran.some((argv) => argv[0] === GIT_BASH)).toBe(true)
})

test('a drive-letter folder after cd is taken as absolute', async ($, on) => {
  const cdTargets: string[] = []
  windows(on, (script, args) => {
    if (script.includes('unset CDPATH')) {
      cdTargets.push(args[0])
      return 'C:/work\n'
    }
    return '1 1024 1\n./old/one.txt\n'
  })

  const result = await $.tool.call({ tool: 'Bash', command: 'cd C:/work && rm -rf old' })

  expect(cdTargets).toEqual(['C:/work'])
  expect(result.deny).toContain('delete 1 file (about 1.0 KB)')
})

test('a command that is not risky runs untouched', async ($, on) => {
  let reached = false
  on('tool.call', () => {
    reached = true
    return { result: {} }
  })

  await $.tool.call({ tool: 'Bash', command: 'ls -la' })

  expect(reached).toBe(true)
})
