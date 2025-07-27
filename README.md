# MAIK - German Freelance Contract Generator

An AI-powered chatbot that generates German freelance contracts from project specifications.

## Features

- 🤖 AI-powered German freelance contract generation using OpenRouter
- 📋 Sequential workflow: Intake → Confirm → Draft → Verify → Explain
- 🇩🇪 Specialized for German freelance contracts
- 📄 Outputs plain text contracts ready for use
- 🎯 Interactive CLI with guided prompts

## Quick Start

### 1. Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd maik

# Install dependencies
bun install

# Set up your OpenAI API key
cp env.example .env
# Edit .env and add your OpenAI API key
```

### 2. Get OpenRouter API Key

1. Visit [OpenRouter Platform](https://openrouter.ai/keys)
2. Create a new API key
3. Add it to your `.env` file:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

### 3. Generate a German Freelance Contract

#### Interactive Mode (Recommended)
```bash
bun run interactive
```
The interactive mode will pause between each step (Intake → Confirm → Draft → Verify → Explain) to allow you to provide input and feedback.

#### Command Line Mode
```bash
bun run generate -p "I need a German freelance web development contract for a 3-month project with a Berlin startup"
```

#### With Custom Output File
```bash
bun run generate -p "German freelance graphic design contract for a Munich company" -o my_contract.txt
```

## Usage Examples

### Example 1: German Web Development Contract
```bash
bun run generate -p "I am the founder of a small digital signage business in Berlin. I want to hire a freelance engineer to create software for digital billboards. I need a German contract that covers a 3-month project with clear deliverables and payment terms."
```

### Example 2: German Graphic Design Contract
```bash
bun run generate -p "I need a German contract for a freelance graphic designer to create a brand identity package including logo, business cards, and website design for a Munich company. The project should take 2-3 weeks."
```

## Workflow

The system follows a 5-step process:

1. **📋 Intake** - Gather contract details and requirements
2. **✅ Confirm** - Summarize and confirm specifications
3. **📄 Draft** - Generate the initial contract
4. **🔍 Verify** - Review and identify improvements
5. **📖 Explain** - Provide client-friendly explanation

## File Structure

```
maik/
├── cli.ts                 # Main CLI application
├── contract-processor.ts  # Contract generation logic
├── openai-client.ts      # OpenAI API wrapper
├── types.ts              # TypeScript type definitions
├── prompts/              # System prompts for each step
│   ├── intake.txt        # Contract intake instructions
│   ├── confirm_specs.txt # Specification confirmation
│   ├── draft.txt         # Contract drafting instructions
│   ├── verify.txt        # Contract verification
│   └── explain.txt       # Client explanation
├── examples/             # Example user prompts
└── package.json
```

## Commands

- `bun run start` - Show help
- `bun run generate` - Generate German freelance contract with command line arguments
- `bun run interactive` - Interactive German freelance contract generation with step-by-step user input
- `bun run dev` - Development mode with file watching

## Options

- `-p, --prompt <text>` - Description of the German freelance project
- `-d, --directory <path>` - Directory containing prompt files (default: ./prompts)
- `-o, --output <file>` - Output file path for the contract
- `-k, --api-key <key>` - OpenRouter API key (can also use OPENROUTER_API_KEY env var)

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests (if available)
bun test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Your License Here]
