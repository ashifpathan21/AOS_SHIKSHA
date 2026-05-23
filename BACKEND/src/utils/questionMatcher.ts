import { pipeline, cos_sim } from '@huggingface/transformers';
import type { Question } from '../../generated/prisma/browser.js';


const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

async function checkSemanticMatch(correctAnswer: string, userAnswer: string) {
    try {
        const output1 = await extractor(correctAnswer, { pooling: 'mean', normalize: true });
        const output2 = await extractor(userAnswer, { pooling: 'mean', normalize: true });
        const similarity = cos_sim(output1.tolist(), output2.tolist());
        return similarity >= 0.60;
    } catch (error) {
        return false
    }
}

export async function checkQuestion(answer: string, question: Question) {
    try {
        let isCorrect = answer == question.correctOption;
        if (question.type === 'WRITTEN') {
            isCorrect = await checkSemanticMatch(question.correctOption, answer)
        }
        return isCorrect
    } catch (error) {
        return false
    }
}