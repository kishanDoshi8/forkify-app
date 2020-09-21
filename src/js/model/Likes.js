export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLiked(id, title, author, img) {
        const newLike = { id, title, author, img };
        this.likes.push(newLike);
        //add to localStorage to save even after reload
        this.persistData();
        return newLike;
    }

    removeLiked(id) {
        const index = this.likes.findIndex(el => el.id === id);
        this.likes.splice(index, 1);

        //add to localStorage to save even after reload
        this.persistData();
    }

    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    totalLiked() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', (JSON.stringify(this.likes)));
    }

    readStorage() {
        const storage = localStorage.getItem('likes');
        this.likes = JSON.parse(storage);
    }
}