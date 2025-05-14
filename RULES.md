# 📏 AI Development Guidelines - DomDom Project

These guidelines provide structured rules for working with AI tools (GitHub Copilot, ChatGPT) to ensure high-quality, maintainable code and efficient interactions during the development of the DomDom operational system.

## 🌟 Golden Rules

These high-level principles guide how to work with AI tools efficiently and effectively:
- code complexty should be kept to a minimum
- Keep files under 100 lines - split into modules when needed
  - Update TASKS.md file if there is any update needed
  - In tasks description be specific as much as possible
  - One task per message is ideal
  - Write documentation and comments as you go
  - Be specific in requests and provide examples
  - Test early and often
  - don't use any type unless it's necessary and if you used them add eslint ignore rule
  - To improve maintainability in modules, you can split large files into multiple smaller files, such as creating a services or utils folder with related functions. Then, import these functions where needed.
  - always check and update README.md, PLANNING.md, RULES.md, TASKS.md, PROJECT_OVERVIEW.md on each task you work on
  - create a branch in git for each task you work on and the name of the branch doesn't surpass 50 characters then push it
  - the commit message must start with 'chore:','fix:','add:','delete:' etc ...
  - you only push the commit when i tell you the task is complete
  - keep a map for the project files to make your work easier
  - when working on task don't hesitate to update both frontend and backend if needed
  - when working on the project try to create subfolder to keep it clean as possible
  - i'm using powershell windows

1. Use markdown files to manage the project (README.md, PLANNING.md, TASKS.md).
2. Keep files under 500 lines. Split into modules when needed.
3. Start fresh conversations often. Long threads degrade response quality.
4. Don't overload the model. One task per message is ideal.
5. Test early, test often. Every new function should have unit tests.
6. Be specific in your requests. The more context, the better. Examples help a lot.
7. Write docs and comments as you go. Don't delay documentation.

## 🔄 Project Awareness & Context

- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASKS.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
- **Refer to PROJECT_OVERVIEW.md** for a comprehensive understanding of the system components and implementation status.

## 🧱 Code Structure & Modularity

- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear, consistent imports** (prefer relative imports within packages).
- **Check if the type exists before creating new ones** to avoid duplication.
- **Always put types in a central location** in the `src/types` directory for better organization and reusability.

### Frontend Structure Guidelines

- Keep React components focused and single-purpose
- Separate business logic from UI using hooks
- Group related components in feature folders

### Backend Structure Guidelines

- Follow NestJS module structure
- Keep controllers thin, move business logic to services
- Use DTOs for data validation and transformation

## 🧪 Testing & Reliability

- **Create unit tests for new features** (functions, classes, routes).
- **After updating any logic**, check whether existing unit tests need to be updated.
- **Tests should live in a `/test` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case

## ✅ Task Completion

- **Mark completed tasks in `TASKS.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASKS.md` under a "Discovered During Work" section.
- Update implementation status in PROJECT_OVERVIEW.md when completing features.

## 📚 Documentation & Explainability

- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline comment explaining the why**, not just the what.
- Document API endpoints with appropriate JSDoc or Swagger annotations.

## 🧠 AI Interaction Guidelines

- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Start new conversations** when switching to a different feature or component.
- **Provide specific requirements** when requesting code generation.
- **Include examples** when explaining desired behavior.

## 🌐 Application-Specific Guidelines

- **Follow the established internationalization pattern** for all user-facing strings.
- **Maintain consistency with Ant Design patterns** for the UI components.
- **Use React Query patterns** for data fetching and state management.
- **Follow the established error handling patterns** throughout the application.
