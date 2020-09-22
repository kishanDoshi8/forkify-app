import Recipe from './model/Recipe';
import Search from './model/Search';
import List from './model/List';
import Likes from './model/Likes';
import { elements, renderLoader, clearLoader } from './view/base';
import * as searchView from './view/searchView';
import * as recipeView from './view/recipeView';
import * as listView from './view/listView';
import * as likesView from './view/likesView';


/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked items (object)
 */
const state = {};
{
    window.state = state;
    // state.likes = new Likes(); 
    // likesView.toggleLikeMenu(state.likes.totalLiked()); 
} // testing purpose only

window.addEventListener('load', e => {
    //initialize and read storage data for liked items (if any)
    state.likes = new Likes();
    state.likes = state.likes.readStorage();

    //render or show liked items to the liked list UI
    if(state.likes){
        state.likes.likes.forEach(like => likesView.renderLike(like));
        likesView.toggleLikeMenu(state.likes.totalLiked()); 
    } else {
        likesView.toggleLikeMenu(false);
    }
});

/**
 * Search Controller
 */
const controlSearch = async () => {
    // 1. Get search item
    const query = searchView.getInput();
    if(query){
        //2. New search object and save its state
        state.Search = new Search(query);
        //3. UI reload and prepare for results
        //add reload spinner
        searchView.clearSearch();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        
        try {
            //4. Search for recipes
            await state.Search.getResult();

            //5. Render results on UI
            clearLoader();
            searchView.renderResults(state.Search.result);
            // console.log(state.Search.result);
        } catch (err) {
            console.log("Error: " + err);
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    //clear previous results and next/previous buttons
    searchView.clearResults();

    const button = e.target.closest('.btn-inline');
    const page = parseInt(button.dataset.goto);
    searchView.renderResults(state.Search.result, page);
});

/**
 * Recipe Controller
 */
const controlRecipe = async (event) => {
    
    // Get id
    const id = window.location.hash.replace('#', '');

    if(id) {
        // Get and save recipe
        state.recipe = new Recipe(id);
        try {
            recipeView.clearRecipe();
            await state.recipe.getRecipe();
            // Get servings and time
            state.recipe.calcServings();
            state.recipe.calcTime();
            state.recipe.parseIngredients();
            // Render recipe to UI
            clearLoader();
            if(state.Search) searchView.highlightSelected(id);
            if(state.likes){
                recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
            } else{
                recipeView.renderRecipe(state.recipe)
            }
        } catch (error) {
            console.log('Error in controlRecipe: ' + error);
        } 
    }
}

 ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * List Controller
 */
const controlList = () => {
    //create a new list if there's none yet
    if(!state.list) state.list = new List();

    //Add ingredients to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addIngredient(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//handle delete and update list buttons
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete item from database and UI
        state.list.deleteIngredient(id);
        listView.deleteItem(id);

    //handle update count
    } else if (e.target.matches('.shoppoing__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/**
 * Like Controller
 */
const controlLike = () => {
    //Create likes list if not already
    if(!state.likes) state.likes = new Likes();

    const id = state.recipe.id;

    if(state.likes.isLiked(id)) {
        //is already liked so remove from list
        state.likes.removeLiked(id);
        // toggle liked class
        likesView.toggleLikeBtn(false);

        //Remove from likes in UI
        likesView.deleteLike(id);
    } else {
        //is NOT liked so add to list
        const newLike = state.likes.addLiked(id, state.recipe.title, state.recipe.author, state.recipe.img);
        
        // toggle liked class
        likesView.toggleLikeBtn(true);

        //Add to likes in UI
        likesView.renderLike(newLike);
    }
    likesView.toggleLikeMenu(state.likes.totalLiked());
}

 elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        //decrese servings and ingredients
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        //decrese servings and ingredients
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
        //add all ingredients to the shopping list
        console.log('Add to shopping list');
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //add to liked
        controlLike();
    }
 });

