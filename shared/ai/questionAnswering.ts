import {env, pipeline, PipelineType, QuestionAnsweringOutput, QuestionAnsweringPipeline} from "@xenova/transformers";

env.allowLocalModels = false;

const CONTACT_NAME_QUESTION = 'Wer hat den Text geschrieben?';
const MIN_CONTACT_NAME_SCORE = 0.002;

export default async function getContactName(text: string, progressCallback?: Function) {
    const classifier = await QuestionAnsweringSingleton.getInstance(progressCallback);
    const output = await classifier(CONTACT_NAME_QUESTION, text) as QuestionAnsweringOutput;

    if (output.score > MIN_CONTACT_NAME_SCORE) {

        // workaround for model not giving the exact answer;
        // "Karl-Heinz Müller" results in "karl - heinz müller"
        const senderAnswerModified = output.answer.replace(' - ', '-');
        const textModified = text.toLowerCase();

        const startIndex = textModified.indexOf(senderAnswerModified);
        const endIndex = startIndex + output.answer.length;

        return text.slice(startIndex, endIndex);
    }

    return undefined;
}

class QuestionAnsweringSingleton {
    static task: PipelineType = 'question-answering';
    static model = 'conventic/electra-base-de-squad2-onnx';
    static instance: QuestionAnsweringPipeline | null = null;

    static async getInstance(progress_callback?: Function) {
        if (this.instance === null) {
            this.instance = (await pipeline(this.task, this.model, {progress_callback})) as QuestionAnsweringPipeline;
        }
        return this.instance;
    }
}