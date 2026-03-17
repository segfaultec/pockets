
export function ClsCombine(...names: Array<string | undefined>): string {
    let out_str = "";
    for (const name of names) {
        if (name) {
            if (out_str) {
                out_str += " ";
            }
            out_str += name;
        }
    }
    return out_str;
} 