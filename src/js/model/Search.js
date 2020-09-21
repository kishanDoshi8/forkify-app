import axios from 'axios';

export default class Search{
    constructor(query){
        this.query = query;
    }

    async getResult(){
        const url = `https://forkify-api.herokuapp.com/api/search?&q=${this.query}`;
        try{
            const result = await axios(url);
            this.result = result.data.recipes;

            // Save query to lcoalStorage
            localStorage.setItem('search', this.query); 
            // console.log(this.result);
        } catch (error) {
            alert(error);
        }
    }

    readStorage() {
        return localStorage.getItem('search');
    }
}