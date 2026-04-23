# DevOps Buddy UI - Agent Directives

## Architecture: Three-Layer (DOE)
1. **Directive:** Follow the brand guidelines and UI instructions strictly.
2. **Orchestration:** Use React/Next.js for the frontend. Connect to Supabase for database reads (Q-values) and n8n via Webhook/MCP for triggering manual fixes.
3. **Execution:** Write clean, modular, self-healing code.

## Self-Annealing Rules
- If an API call fails, read the stack trace, fix the script, and update the environment variables.
- Maintain a highly responsive, modern, dark-mode-first dashboard.
