import uniqid from 'uniqid';

export default class List {
    constructor () {
        this.items = [];
    }

    addIngredient(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteIngredient(id) {
        const index = this.items.findIndex(el => el.id === id);

        if(index > -1) {
            this.items.splice(index, 1);
        }
    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }
}