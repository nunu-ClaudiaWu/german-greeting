import {useCallback, useEffect, useRef, useState} from "react";

export default function useCreateGreeting(): [string | null, boolean | null, (text: string) => void] {
    const workerRef = useRef<Worker>();

    const [greeting, setGreeting] = useState(null);
    const [ready, setReady] = useState<boolean | null>(null);

    useEffect(() => {
        if (!workerRef.current) {
            workerRef.current = new Worker(new URL("../../greetingWorker.ts", import.meta.url), {type: 'module'});
        }

        const onMessageReceived = (e: MessageEvent) => {
            switch (e.data.status) {
                case 'initiate':
                    setReady(false);
                    break;
                case 'ready':
                    setReady(true);
                    break;
                case 'complete':
                    setGreeting(e.data.output);
                    break;
            }
        };
        workerRef.current.addEventListener('message', onMessageReceived);

        return () => workerRef.current?.removeEventListener('message', onMessageReceived);
    }, []);

    const updateGreeting = useCallback((text: string) => {
        setGreeting(null);
        workerRef.current?.postMessage({text: text.trim()});
    }, []);

    return [greeting, ready, updateGreeting];
}