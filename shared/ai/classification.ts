import {
    env,
    pipeline,
    PipelineType,
    ZeroShotClassificationOutput,
    ZeroShotClassificationPipeline
} from "@xenova/transformers";
import {Gender} from "../types";

env.allowLocalModels = false;

const GenderClassificationLabels = new Map<string, Gender>([
    ['first name of a woman', Gender.FEMALE],
    ['first name of a man', Gender.MALE]
]);

const MIN_GENDER_SCORE = 0.6;

export default async function getGenderByFirstname(firstname: string, progressCallback: Function) {

    const answerer = await ClassificationSingleton.getInstance(progressCallback);
    const labels = Array.from(GenderClassificationLabels.keys());
    const output = await answerer(firstname, labels) as ZeroShotClassificationOutput;

    if (output.scores[0] > MIN_GENDER_SCORE) {
        return GenderClassificationLabels.get(output.labels[0]);
    }

    return undefined;
}

class ClassificationSingleton {
    static task: PipelineType = 'zero-shot-classification';
    static model = 'Xenova/bart-large-mnli';
    static instance: ZeroShotClassificationPipeline | null = null;

    static async getInstance(progress_callback?: Function) {
        if (this.instance === null) {
            this.instance = (await pipeline(this.task, this.model, {progress_callback})) as ZeroShotClassificationPipeline;
        }
        return this.instance;
    }
}