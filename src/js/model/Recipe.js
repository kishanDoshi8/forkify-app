import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try{
            const recipe = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);  
            this.img = recipe.data.recipe.image_url;
            this.ingredients = recipe.data.recipe.ingredients;
            this.author = recipe.data.recipe.publisher;
            this.title = recipe.data.recipe.title;
        } catch (error) {
            console.log('Error: ' + error);
        }
    }

    calcTime() {
        const period = Math.ceil(this.ingredients.length / 3);
        this.time = period * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
 
        const newIngredients = this.ingredients.map(el => {
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitShort[i]);
            });
 
            // 2) Remove parantheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
 
            // 3> Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => unitShort.includes(el2));
 
            let objIng;
            if (unitIndex > -1) {
                // There is a unit
                // Ex. 4 1/2 cups, arrCount is [4, 1/2] --> eval("4+1/2") --> 4.5
                // Ex. 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);  
 
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
 
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };
 
            } else if (parseInt(arrIng[0], 10)) {
                // There is NO unit, but the 1st element is a nummber
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                // There is no unit and NO number in 1st position
                objIng = {
                    count: 1,
                    unit:'',
                    ingredient
                }
            }
 
            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        //update servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        //update ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}