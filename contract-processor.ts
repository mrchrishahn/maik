import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { OpenAIClient } from './openai-client.ts';
import type { ProcessConfig, ContractStep, ContractSession } from './types.ts';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

export class ContractProcessor {
  private client: OpenAIClient;
  private config: ProcessConfig;
  private session: ContractSession;

  constructor(config: ProcessConfig) {
    this.client = new OpenAIClient(config.apiKey);
    this.config = config;
    this.session = {
      userPrompt: config.userPrompt,
      conversationHistory: []
    };
  }

  private loadPromptFile(filename: string): string {
    const filePath = join(this.config.directory, filename);
    if (!existsSync(filePath)) {
      throw new Error(`Prompt file not found: ${filePath}`);
    }
    return readFileSync(filePath, 'utf-8').trim();
  }

  private async executeStep(stepName: string, systemPrompt: string, userMessage: string): Promise<string> {
    const spinner = ora(`Executing ${stepName}...`).start();
    
    try {
      const response = await this.client.generateContractStep(
        systemPrompt,
        userMessage,
        this.session.conversationHistory
      );
      
      // Add to conversation history
      this.session.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response }
      );
      
      spinner.succeed(`${stepName} completed`);
      return response;
    } catch (error) {
      spinner.fail(`${stepName} failed`);
      throw error;
    }
  }

  private async getUserInput(prompt: string, defaultValue?: string): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: prompt,
        default: defaultValue,
        validate: (input: string) => {
          if (input.trim().length === 0) {
            return 'Please provide some input';
          }
          return true;
        }
      }
    ]);
    return answer.input;
  }

  async processContract(): Promise<string> {
    console.log(chalk.blue('\n🤖 Starting German Freelance Contract Generation Process...\n'));
    
    try {
      // Step 1: Intake - Gather contract details
      console.log(chalk.yellow('📋 Step 1: Contract Intake'));
      const intakePrompt = this.loadPromptFile('intake.txt');
      const intakeResponse = await this.executeStep(
        'Intake',
        intakePrompt,
        this.session.userPrompt
      );
      console.log(chalk.gray('\nIntake Response:'), intakeResponse);
      
      // Pause for user input
      console.log(chalk.blue('\n⏸️  Pausing for your input...'));
      const userInput1 = await this.getUserInput(
        'Please provide any additional details or clarifications for the intake:',
        'No additional details needed'
      );
      console.log('');

      // Step 2: Confirm specifications
      console.log(chalk.yellow('✅ Step 2: Confirm Specifications'));
      const confirmPrompt = this.loadPromptFile('confirm_specs.txt');
      const confirmResponse = await this.executeStep(
        'Confirmation',
        confirmPrompt,
        `User Request: ${this.session.userPrompt}\n\nIntake Information: ${intakeResponse}\n\nAdditional Details: ${userInput1}`
      );
      console.log(chalk.gray('\nConfirmation Response:'), confirmResponse);
      
      // Pause for user input
      console.log(chalk.blue('\n⏸️  Pausing for your input...'));
      const userInput2 = await this.getUserInput(
        'Please confirm these specifications or provide any corrections:',
        'Specifications look good'
      );
      console.log('');

      // Step 3: Draft the contract
      console.log(chalk.yellow('📄 Step 3: Drafting Contract'));
      const draftPrompt = this.loadPromptFile('draft.txt');
      const draftResponse = await this.executeStep(
        'Drafting',
        draftPrompt,
        `User Request: ${this.session.userPrompt}\n\nConfirmed Specifications: ${confirmResponse}\n\nUser Confirmation: ${userInput2}`
      );
      this.session.contractDraft = draftResponse;
      console.log(chalk.gray('\nContract Draft Generated'));
      console.log(chalk.gray('Preview:'), draftResponse.substring(0, 200) + '...');
      
      // Pause for user input
      console.log(chalk.blue('\n⏸️  Pausing for your input...'));
      const userInput3 = await this.getUserInput(
        'Please review the draft and provide any feedback or specific requirements:',
        'Draft looks good, proceed with verification'
      );
      console.log('');

      // Step 4: Verify and improve the contract
      console.log(chalk.yellow('🔍 Step 4: Verifying Contract'));
      const verifyPrompt = this.loadPromptFile('verify.txt');
      const verifyResponse = await this.executeStep(
        'Verification',
        verifyPrompt,
        `User Request: ${this.session.userPrompt}\n\nContract Draft: ${draftResponse}\n\nUser Feedback: ${userInput3}`
      );
      console.log(chalk.gray('\nVerification Response:'), verifyResponse);
      
      // Pause for user input
      console.log(chalk.blue('\n⏸️  Pausing for your input...'));
      const userInput4 = await this.getUserInput(
        'Please review the verification feedback and provide any final adjustments:',
        'Verification feedback looks good'
      );
      console.log('');

      // Step 5: Explain the contract to the client
      console.log(chalk.yellow('📖 Step 5: Explaining Contract'));
      const explainPrompt = this.loadPromptFile('explain.txt');
      const explainResponse = await this.executeStep(
        'Explanation',
        explainPrompt,
        `User Request: ${this.session.userPrompt}\n\nFinal Contract: ${draftResponse}\n\nVerification Notes: ${verifyResponse}\n\nFinal Adjustments: ${userInput4}`
      );
      console.log(chalk.gray('\nExplanation Generated'));
      console.log(chalk.gray('Preview:'), explainResponse.substring(0, 200) + '...');
      
      // Pause for user input
      console.log(chalk.blue('\n⏸️  Pausing for your input...'));
      const userInput5 = await this.getUserInput(
        'Please provide any final notes for the contract explanation:',
        'Explanation looks good'
      );
      console.log('');

      // Generate final contract with improvements
      const finalContract = await this.generateFinalContract(draftResponse, verifyResponse, userInput4, userInput5);
      this.session.finalContract = finalContract;

      return finalContract;
    } catch (error) {
      console.error(chalk.red('❌ Error during contract processing:'), error);
      throw error;
    }
  }

  private async generateFinalContract(draft: string, verification: string, userAdjustments: string, userExplanation: string): Promise<string> {
    const spinner = ora('Generating final contract...').start();
    
    try {
      const finalPrompt = `You are a legal expert specializing in German freelance contracts. Based on the contract draft, verification feedback, and user input, generate the final improved contract.

Contract Draft:
${draft}

Verification Feedback:
${verification}

User Adjustments:
${userAdjustments}

User Explanation Notes:
${userExplanation}

Please generate the final German freelance contract incorporating all necessary improvements from the verification feedback and user input. The contract should be well-structured, legally sound for German jurisdiction, and ready for use.`;

      const finalContract = await this.client.generateContractStep(
        finalPrompt,
        'Generate the final German freelance contract',
        this.session.conversationHistory
      );
      
      spinner.succeed('Final contract generated');
      return finalContract;
    } catch (error) {
      spinner.fail('Failed to generate final contract');
      throw error;
    }
  }

  async saveContract(outputPath?: string): Promise<void> {
    if (!this.session.finalContract) {
      throw new Error('No contract to save. Run processContract() first.');
    }

    const filename = outputPath || `german_freelance_contract_${Date.now()}.txt`;
    writeFileSync(filename, this.session.finalContract, 'utf-8');
    console.log(chalk.green(`✅ German freelance contract saved to: ${filename}`));
  }
} 