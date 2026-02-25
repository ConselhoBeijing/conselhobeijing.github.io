# .GITHUB AUTOMATION KNOWLEDGE BASE

## OVERVIEW
CI/CD and Python automation for Hugo deployment and calendar subscription generation.

## STRUCTURE
```
.github/
├── workflows/
│   ├── hugo-deploy.yml       # Production build and deploy to GitHub Pages
│   └── update-calendars.yml  # Monthly cron for holiday data updates
└── scripts/
    ├── generate-ics.py       # Converts JSON holidays to ICS format
    ├── update-calendars.py   # Forecasts future holiday JSON structures
    └── README.md             # Documentation for script parameters
```

## WHERE TO LOOK
| Task | Location | Logic |
|------|----------|-------|
| Modify deployment | `workflows/hugo-deploy.yml` | Hugo setup + Python pre-build execution |
| Change cron schedule | `workflows/update-calendars.yml` | Monthly cron (`0 0 1 * *`) repository updates |
| ICS logic changes | `scripts/generate-ics.py` | VCALENDAR generation using Python stdlib |
| Holiday forecasting | `scripts/update-calendars.py` | Brazilian holiday algorithm (Easter-based) |
| Script documentation | `scripts/README.md` | Arguments and execution instructions |

## CONVENTIONS
- **Runtime:** Python 3.x with standard library ONLY; no external package dependencies.
- **Build Flow:** ICS generation must complete before Hugo static site build starts.
- **Path Resolution:** Scripts use repo-root relative paths via `pathlib`.
- **Deployment:** Targets GitHub Pages using official `actions/deploy-pages`.
- **Cron Frequency:** Monthly update-calendars workflow prevents data rot.
- **Output:** Generated ICS files reside in `static/calendars/` during build.
- **Automation ID:** Git commits from workflows use a generic bot identity.
- **Script Style:** Procedural Python; minimal abstractions; fail-fast error handling.

## ANTI-PATTERNS
- **Lunar Logic:** Never automate Chinese holidays; manual JSON entry is required.
- **Caching:** Do not configure caching for Hugo or Python; prefer fresh runs.
- **Verification:** Project lacks automated test steps for scripts and Hugo build.
- **Runtime Bloat:** Avoid adding Node.js, Ruby, or pip requirements to workflows.
- **Direct Pushes:** Automation should not bypass PRs for core content/config.
- **Hardcoded Paths:** Never use absolute paths; always calculate from script location.
- **Manual ICS:** Do not edit ICS files manually; update holiday JSON and regenerate.
