# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Python Standard Library Learning Repository** (python标准库学习) - a structured educational resource for mastering Python's built-in modules. The content follows the **Pareto Principle (80/20 rule)**: focus on mastering the critical 20% of APIs that cover 80% of daily development scenarios.

**Target Audience:** Intermediate to advanced Python developers transitioning from basic syntax to engineering proficiency.

**Language:** Documentation is in Chinese.

## Core Documentation Files

### Master Plan
- **`python标准库学习计划.md`** - The comprehensive 10-week learning curriculum with detailed module analysis, technical insights, and project roadmaps

### Quick Reference
- **`00_速查表.md`** - API cheat sheet for rapid review (scan-friendly format with core APIs only)

### Module-Specific Documentation (8 modules)
| Module File | Focus | Key Concepts |
|-------------|-------|--------------|
| `python标准库-pathlib.md` | Modern path handling | Object-oriented paths, `/` operator, glob patterns |
| `python标准库-os.md` | OS interface | Environment variables, directory operations |
| `python标准库-shutil.md` | File operations | High-level file operations (copy, move, rmtree) |
| `python标准库-json.md` | JSON serialization | load/dump vs loads/dumps, custom encoders |
| `python标准库-csv.md` | CSV processing | DictReader/DictWriter for robust parsing |
| `python标准库-random.md` | Random generation | Integers, sequences, distributions |
| `python标准库-re.md` | Regular expressions | Pattern matching, search, sub, compile |
| `python标准库-string.md` | String utilities | Character constants, Template class |

## Content Structure Pattern

Each module markdown file follows a consistent three-part structure:

1. **概述 (Overview)** - Module introduction and design philosophy
2. **常用 API 详解 (Core API Reference)** - Detailed tables with syntax, descriptions, and code examples
3. **实战小项目 (Practical Mini-Project)** - Complete working code demonstrating real-world usage

## Practical Projects Included

The documentation includes these complete project implementations:

- **智能文件分类整理器** (Intelligent File Organizer) - Automatic file organization by extension using pathlib/shutil
- **日志分析统计引擎** (Log Analytics Engine) - Traffic analysis using collections/itertools
- **隐私信息清洗机** (PII Scrubber) - Sensitive data masking using regex
- **全球会议调度器** (World Clock Scheduler) - Timezone conversion using datetime/zoneinfo
- **批量缩略图生成器** (Thumbnail Generator) - Concurrent processing with concurrent.futures

## Modern Python Practices Emphasized

This repository emphasizes **Python 3.9+** best practices:

- **pathlib** over os.path for path operations
- **zoneinfo** over pytz for timezone handling
- **dataclasses** over namedtuple for complex data objects
- **f-strings** for string formatting
- **Type hints** for function signatures
- **Context managers** (with statements) for resource management

## Development Notes

- This is a **documentation-only repository** with no executable Python scripts
- No build system, tests, or dependencies
- Content is designed for **self-paced learning** - each module can be studied independently
- Code examples are embedded directly in markdown files for easy reference

## Common Tasks

When working with this repository:

- **To review all APIs:** Start with `00_速查表.md` for a comprehensive overview
- **To learn a specific module:** Read the corresponding module-specific markdown file
- **To plan learning:** Follow the 10-week curriculum in `python标准库学习计划.md`
- **To see practical examples:** Each module file contains a complete working project in the "实战小项目" section

## Related Resources in Parent Directory

This repository is part of a larger Python learning journey (`阶段2python强化` - Stage 2 Python Reinforcement).
