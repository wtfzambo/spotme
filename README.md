<!-- markdownlint-disable MD036 -->

<p align="center">
    <img src="./imgs/spotme.png", width=50%>
</p>

<h6 align="center"><i>Gym mode for agentic coding</i></h6>

<h1></h1>

Instead of writing 100% of the code for you, the agent scaffolds a logical unit, hands it off, watches you implement it, and reviews your work before resuming.

<p align="center">
  <sub>___ <q><i>Keep your edge</i></q> ___</sub>
</p>

<p align="center">
    <img src="./imgs/spotme.gif", width=80%>
</p>

---

**Heavy AI usage makes you stupid.**

<p align="center">
<a href="https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/">Science</a>. <a href="https://arxiv.org/abs/2511.02922v2">says</a>. <a href="https://arxiv.org/abs/2506.08872">so</a>.
</p>

<p align="center">
    <img src="./imgs/doge.jpg", width=40%>
</p>
<p align="center">
<a href="https://www.anthropic.com/research/AI-assistance-coding-skills">Anthropic too</a>.
</p>

When **BIG BAD AI COMPANY™** warns us about the negative effects of its own product, we should probably pay attention.

Much like sitting on your ass all day makes you weak and sad, keeping your brain in powersave mode all day makes you lazy and dumb.

The first you fix by going to the gym.

**The second you fix by using SpotMe.**

---

## How it works

1. Enable SpotMe at the start of a session: `/spotme:on [lite|medium|hard] [--every N]`
2. Every N code-writing actions, the agent scaffolds the next unit instead of completing it
3. You implement the marked section (`# SPOTME: ...`) directly in your editor
4. `/spotme:done` → agent checks your work and gives brief, calibrated feedback
5. Agent resumes the original task

## Commands

| Command | Description |
|---------|-------------|
| `/spotme:on [lite\|medium\|hard] [--every N]` | Enable gym mode. Default: medium, every 2 |
| `/spotme:off` | Disable — agent writes code normally |
| `/spotme:status` | Show current state |
| `/spotme:rep` | Request an exercise on-demand |
| `/spotme:done` | Submit your implementation for review |
| `/spotme:hint` | Get one targeted hint |
| `/spotme:solve` | Concede — agent completes the exercise |
| `/spotme:skip` | Skip this exercise, no note |

## Difficulty levels

| Level | Agent writes | You write |
|-------|-------------|-----------|
| `lite` | Signature + docstring + structure | Just the body |
| `medium` | Signature + `# SPOTME:` spec comment | All logic |
| `hard` | Plain English spec comment only | Everything |

## Install

### OpenCode

Add to your `opencode.json`:
```json
{
    "$schema": "https://opencode.ai/config.json",
    "plugin": ["spotme"]
}
```

### Pi (WIP)

> [!WARNING]
> Pi integration is currently Work In Progress and has NOT been tested.

Install as a Pi package once published:

```bash
pi install npm:spotme
```

### Skill only (any harness that supports AgentSkills)

Copy `SKILL.md` into your harness's skills directory. This gives the prompt layer without the automated tool interception — commands still work, but the counter-based trigger won't fire automatically.

## Star History

<a href="https://www.star-history.com/?repos=wtfzambo%2Fspotme&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=wtfzambo/spotme&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=wtfzambo/spotme&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=wtfzambo/spotme&type=date&legend=top-left" />
 </picture>
</a>

<p align="center">
    <i>Like it? Star it!</i>
</p>

## Local Development

To develop and test a branch locally:

```bash
# 1. Clone SpotMe locally
mkdir ~/temp && cd ~/temp
git clone https://github.com/wtfzambo/spotme.git

# 2. Create a new directory somewhere
mkdir ./test_spotme && cd ./test_spotme

# 3. Run scripts/test-local-branch.sh from the new folder
../spotme/scripts/test-local-branch.sh
```

Then, in `test_spotme`, open your agent harness (OpenCode, Pi...) and verify spotme commands exist. Finally, checkout the SpotMe branch you need.

## Name

The agent is your **spotter**. It sets up the lift, stands by while you push, catches you if you call for help. The work is yours.
