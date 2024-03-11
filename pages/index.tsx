import useCreateGreeting from "../shared/hooks/useCreateGreeting";
import {FormEvent, useState} from "react";
import styles from "../shared/styles.module.css";
import texts from "../shared/texts.json";

export default function Index() {
    const [greeting, loading, updateGreeting] = useCreateGreeting();
    const [text, setText] = useState(texts[0].text);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;
        const formElements = form.elements as typeof form.elements & {
            textInput: { value: string }
        }
        updateGreeting(formElements.textInput.value);
    }

    return (
        <div className={styles.App}>
            <form onSubmit={handleSubmit} className={styles.AppHeader}>
                <label htmlFor="texts">Choose a text example:</label>
                <select name="texts" id="texts" 
                        onChange={(event) => setText(event.target.value)}>
                    {texts.map((textObject, key) =>
                        <option value={textObject.text} key={key}>{textObject.title}</option>
                    )}
                </select>
                <textarea className={styles.AppInput} id="textInput" value={text} 
                          onChange={(event) => setText(event.target.value)}>
                </textarea>
                <button className={styles.AppButton} type="submit" disabled={loading}>
                    Generate German Greeting
                </button>
                <div className={styles.AppOutput}>
                    {loading ? 'Processing...' : greeting}
                </div>
            </form>
        </div>
    );
}