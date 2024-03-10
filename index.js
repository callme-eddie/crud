class Recipe {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.ingredients = [];
    }

    addIngredients(name, quantity) {
        this.ingredients.push(new Ingredients(name, quantity));
    }
}

class Ingredients {
    constructor(name, quantity) {
        this.name = name;
        this.quantity = quantity;
    }
}

class RecipeService {
    static url = 'http://localhost:3000/recipes';

    static getAllRecipes() {
        return $.get(this.url);
    }

    static getRecipe(id) {
        return $.get(`${this.url}/${id}`);
    }

    static createRecipe(recipe) {
        return $.post(this.url, recipe);
    }

    static updateRecipe(recipe) {
        return $.ajax({
            url: `${this.url}/${recipe.id}`,
            dataType: 'json',
            data: JSON.stringify(recipe),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteRecipe(id) {
        return $.ajax({
            url: `${this.url}/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static recipes;

    static getAllRecipes() {
        RecipeService.getAllRecipes().then(recipes => this.render(recipes));
    }

    static deleteRecipe(id){
       RecipeService.deleteRecipe(id) 
        .then(() => {
            return RecipeService.getAllRecipes();
        })
        .then((recipes) => this.render(recipes));
    }

    static createRecipe(name) {
        const id = Date.now(); // Generate a unique id using Date.now()
        RecipeService.createRecipe(new Recipe(id, name))
            .then(() => {
                return RecipeService.getAllRecipes();
            })
            .then((recipes) => this.render(recipes));
    }

    static render(recipes) {
        this.recipes = recipes;
        $('#app').empty();
        for (let recipe of recipes) {
            $('#app').prepend(
                `<div id="${recipe.id}" class="card'>
                    <div class="card-header">
                        <h2>${recipe.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteRecipe('${recipe.id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${recipe.id}-ingredient-name" class="form-control" placeholder="ingredient-name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${recipe.id}-ingredient-quantity" class="form-control" placeholder="ingredient-quantity">
                                </div>
                            </div>
                            <button id="${recipe.id}-new-ingredient" onclick="DOMManager.addIngredient('${recipe.id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            for (let ingredient of recipe.ingredients) {
                $(`#${recipe.id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${ingredient.id}"><strong>Name: </strong> ${ingredient.name}</span>
                        <span id="quantity-${ingredient.id}"><strong>Quantity: </strong> ${ingredient.quantity}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteIngredient('${recipe.id}', '${ingredient.id}')">Delete Ingredient</button>
                    </p>`
                );
            }
        }
    }

    static addIngredient(recipeId) {
        const name = $(`#${recipeId}-ingredient-name`).val();
        const quantity = $(`#${recipeId}-ingredient-quantity`).val();
        RecipeService.getRecipe(recipeId)
            .then((recipe) => {
                recipe.addIngredients(name, quantity);
                return RecipeService.updateRecipe(recipe);
            })
            .then(() => {
                return RecipeService.getAllRecipes();
            })
            .then((recipes) => this.render(recipes));
    }
}

$('#create-new-recipe').click(() =>{
    DOMManager.createRecipe($('#new-recipe-name').val());
    $('#new-recipe-name').val('');
});

DOMManager.getAllRecipes();
