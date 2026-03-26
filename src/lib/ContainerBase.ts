

export class ContainerBase<TKey, TValue> {
    protected data: Map<TKey, TValue> = new Map();
    protected order: TKey[] = [];

    protected static newFromData<TKey, TValue>(data: Map<TKey, TValue>, order: TKey[]): ContainerBase<TKey, TValue> {
        let newThis = new ContainerBase<TKey, TValue>;
        newThis.data = data;
        newThis.order = order;
        return newThis;
    }

    set(key: TKey, value: TValue) {

        if (!this.has(key)) {
            this.order.push(key);
        }

        this.data.set(key, value);
    }

    add(key: TKey, value: TValue) {
        if (!this.has(key)) {
            this.order.push(key);
            this.data.set(key, value);
        }
    }

    modify(key: TKey, new_value: TValue): boolean {
        const old_value = this.data.get(key);
        if (old_value === undefined) {
            return false;
        }
        this.data.set(key, new_value);
        return true;
    }

    has(key: TKey): boolean {
        return this.data.has(key);
    }

    delete(key_to_delete: TKey): boolean {

        if (!this.has(key_to_delete)) {
            return false;
        }

        this.order = this.order.filter((key) => {return key !== key_to_delete});
        this.data.delete(key_to_delete);

        return true;
    }

    rename(old_key: TKey, new_key: TKey): boolean {
        const attr = this.data.get(old_key);
        if (attr === undefined) {
            return false;
        }
        if (this.data.has(new_key)) {
            return false;
        }
        this.data.delete(old_key);
        this.data.set(new_key, attr);

        const old_key_index = this.order.indexOf(old_key);
        if (old_key_index !== undefined) {
            this.order[old_key_index] = new_key;
        }

        return true;
    }

    get(key: TKey): TValue | undefined {
        return this.data.get(key);
    }

    forEachKey(func: (key: TKey) => void): void {
        this.order.forEach(func);
    }

    forEach(func: (value: TValue, key: TKey) => void): void {
        this.order.forEach((key) => {
            func(this.get(key)!, key);
        });
    }

    clone(): ContainerBase<TKey, TValue> {

        let clone = new ContainerBase<TKey, TValue>();
        this.forEach((value, key) => {
            clone.add(key, value);
        })

        return clone;
    }
}
