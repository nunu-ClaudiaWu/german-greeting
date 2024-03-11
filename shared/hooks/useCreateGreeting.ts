import {useEffect, useState} from "react";
import {generateGreeting} from "../answer-generation/greeting";

export default function useCreateGreeting(): [string | undefined, boolean, (text: string) => void] {
    const [loading, setLoading] = useState<boolean>(false);
    const [greeting, setGreeting] = useState<string | undefined>();
    const [text, setText] = useState<string>();

    useEffect(() => {
        if (text) {
            setLoading(true);
            setTimeout(() => {
                generateGreeting(text).then(greeting => {
                    setGreeting(greeting);
                    setLoading(false);
                });
            }, 50);
        }
    }, [text]);

    const updateGreeting = (text: string) => {
        setText(text.trim());
    };

    return [greeting, loading, updateGreeting];
}