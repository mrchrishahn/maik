#!/usr/bin/env bun

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { ContractProcessor } from "./contract-processor.ts";
import type { ProcessConfig } from "./types.ts";

const program = new Command();

program
  .name("MAIK")
  .description("AI-powered German freelance contract generator")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate a German freelance contract")
  .option("-p, --prompt <text>", "Description of the German freelance project")
  .option("-d, --directory <path>", "Directory containing prompt files", "./prompts")
  .option("-o, --output <file>", "Output file path for the contract")
  .option("-k, --api-key <key>", "OpenRouter API key")
  .action(async (options) => {
    try {
      const config = await getConfiguration(options);
      await generateContract(config);
    } catch (error) {
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

program
  .command("interactive")
  .description("Interactive German freelance contract generation with step-by-step user input")
  .option("-d, --directory <path>", "Directory containing prompt files", "./prompts")
  .option("-o, --output <file>", "Output file path for the contract")
  .option("-k, --api-key <key>", "OpenRouter API key")
  .action(async (options) => {
    try {
      const config = await getInteractiveConfiguration(options);
      await generateContract(config);
    } catch (error) {
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

async function getConfiguration(options: any): Promise<ProcessConfig> {
  // Get API key
  let apiKey = options.apiKey;
  if (!apiKey) {
    const envKey = process.env.OPENROUTER_API_KEY;
    if (envKey && envKey.trim() !== '') {
      apiKey = envKey;
      console.log(chalk.green("✅ Using OpenRouter API key from environment"));
    } else {
      console.log(chalk.yellow("⚠️  No OpenRouter API key found in environment"));
      console.log(chalk.gray("   You can set OPENROUTER_API_KEY in your .env file"));
      const answer = await inquirer.prompt([
        {
          type: "password",
          name: "apiKey",
          message: "Enter your OpenRouter API key:",
          mask: "*",
        },
      ]);
      apiKey = answer.apiKey;
    }
  }

  // Get user prompt
  let userPrompt = options.prompt;
  if (!userPrompt) {
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "prompt",
        message: "Describe your German freelance project (client, services, duration, etc.):",
        validate: (input: string) => {
          if (input.trim().length < 10) {
            return "Please provide a more detailed description (at least 10 characters)";
          }
          return true;
        },
      },
    ]);
    userPrompt = answer.prompt;
  }

  return {
    apiKey,
    directory: options.directory || "./prompts",
    userPrompt,
    outputFile: options.output,
  };
}

async function getInteractiveConfiguration(options: any): Promise<ProcessConfig> {
  console.log(chalk.blue("🤖 Welcome to MAIK - German Freelance Contract Generator\n"));
  console.log(chalk.gray("This interactive mode will pause between each step to allow you to provide input and feedback.\n"));
  
  // Get API key
  let apiKey = options.apiKey;
  if (!apiKey) {
    const envKey = process.env.OPENROUTER_API_KEY;
    if (envKey && envKey.trim() !== '') {
      apiKey = envKey;
      console.log(chalk.green("✅ Using OpenRouter API key from environment"));
    } else {
      console.log(chalk.yellow("⚠️  No OpenRouter API key found in environment"));
      console.log(chalk.gray("   You can set OPENROUTER_API_KEY in your .env file"));
      const answer = await inquirer.prompt([
        {
          type: "password",
          name: "apiKey",
          message: "Enter your OpenRouter API key:",
          mask: "*",
        },
      ]);
      apiKey = answer.apiKey;
    }
  }

  // Get directory
  const directory = options.directory || "./prompts";

  // Get user prompt with examples
  const answer = await inquirer.prompt([
    {
      type: "input",
      name: "prompt",
      message: "Describe your German freelance project (client, services, duration, etc.):",
      validate: (input: string) => {
        if (input.trim().length < 10) {
          return "Please provide a more detailed description (at least 10 characters)";
        }
        return true;
      },
    },
  ]);

  // Get output file
  const outputAnswer = await inquirer.prompt([
    {
      type: "input",
      name: "output",
      message: "Output file name (optional, press Enter for auto-generated name):",
      default: "",
    },
  ]);

  return {
    apiKey,
    directory,
    userPrompt: answer.prompt,
    outputFile: outputAnswer.output || undefined,
  };
}

async function generateContract(config: ProcessConfig): Promise<void> {
  console.log(chalk.blue("\n🚀 Starting German freelance contract generation...\n"));
  console.log(chalk.gray("Project Description:"), config.userPrompt);
  console.log(chalk.gray("Prompts Directory:"), config.directory);
  console.log("");

  const processor = new ContractProcessor(config);
  
  try {
    const contract = await processor.processContract();
    
    console.log(chalk.green("\n🎉 German freelance contract generated successfully!\n"));
    console.log(chalk.yellow("Generated Contract Preview:"));
    console.log(chalk.gray("─".repeat(50)));
    console.log(contract.substring(0, 500) + (contract.length > 500 ? "..." : ""));
    console.log(chalk.gray("─".repeat(50)));
    
    // Save the contract
    await processor.saveContract(config.outputFile);
    
    console.log(chalk.green("\n✅ German freelance contract has been saved successfully!"));
  } catch (error) {
    console.error(chalk.red("\n❌ German freelance contract generation failed:"));
    throw error;
  }
}

// Handle help
program.addHelpText('after', `

Examples:
  $ maik generate -p "I need a German freelance web development contract for a 3-month project with a Berlin startup"
  $ maik generate --prompt "German freelance graphic design contract for a Munich company" --output my_contract.txt
  $ maik interactive

For more information, visit: https://github.com/your-repo/maik
`);

program.parse();
