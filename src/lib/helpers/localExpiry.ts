// SAVE with expiry
export function saveWithExpiry(key: string, value: any) {
    console.log("SAVE CALLED", key, value);

    const item = {
        value,
        expiry: Date.now() + 60 * 1000, // 1 minute
    };

    try {
        const str = JSON.stringify(item);
        console.log("SAVING JSON:", str);
        localStorage.setItem(key, str);
    } catch (e) {
        console.error("JSON ERROR:", e);
    }
}

// LOAD with expiry
export function loadWithExpiry(key: string) {
    console.log("LOAD CALLED", key);

    const itemStr = localStorage.getItem(key);
    console.log("LOADED RAW:", itemStr);

    if (!itemStr) return null;

    const item = JSON.parse(itemStr);

    console.log("PARSED:", item);

    if (Date.now() > item.expiry) {
        console.log("EXPIRED → removing");
        localStorage.removeItem(key);
        return null;
    }

    return item.value;
}
