

var num_buttons = 1;
let api_key = '3db63459222c4e7f814092d4ea1fe8f5' ;
console.log("sdf");
console.log(api_key);
function displaydata()
{
    const buttons = document.querySelectorAll("button[type=submit-button]");
    buttons.forEach((button) => 
    {
        button.addEventListener('click', async () => {
        const rowNumber = parseInt(button.id); // Parse the button id to get the row number
        console.log(rowNumber);
        const items = document.querySelectorAll(`.removable${rowNumber}`);
        console.log(items);
        items.forEach((element) => element.remove());
        await displaylist(getData, rowNumber);
        });
    }
    );
}

var Idlist = [];
var titles = [];
async function displaylist(getData, position) {
    const dish_array= Array.from(document.querySelectorAll("input[type='Name']"));
    const dish_names = dish_array.map((element) => element.value);
    console.log(dish_names);
    const ingredients_list = Array.from(document.querySelectorAll("input[type='Ingredients']"));
    const ingredients = ingredients_list.map((list) =>list.value.split(','));
    var data_arr;
    for(let i =0; i < ingredients.length; i++)
    {
        if(ingredients[i] != "" && i == position-1){
            try{
                const data = await getData(dish_names[i], ingredients[i]);
                const temp_titles = data.map((object) => object[1]);
                titles[i] =temp_titles;
                const temp_id = data.map((object) => object[0]);
                Idlist[i]= temp_id;
                
            }
            catch(err)
            {
                console.log('error');
            }
        }
        
    }

    displaynames(titles, position);
    
    
}

async function getData(dish_name, ingredients)
{
    const ingredients_list = ingredients.toString();
    try
    {
        let response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${api_key}&query=${dish_name}&includeIngredients=${ingredients_list}&number=100`);
        const data = await response.json();
        console.log(data);  
        return data.results.map((object) =>[object.id, object.title])
    }   
    catch(err)
    {
        console.log('Error, recipe not found');
    }
}


function displaynames(titles, position)
{
    console.log(titles);
    const names = titles[position-1].map((name)=>{
        return `<option class="removable${position}">${name}</option>`;
    });
    const dropdown = document.getElementById(`titles ${position}`);
    dropdown.innerHTML +=names.join('');
    
}


async function getcals(item_id){

    try{
        let response = await fetch(`https://api.spoonacular.com/recipes/${item_id}/nutritionWidget.json?apiKey=${api_key}`);
        let data = await response.json();
        let calories = data.nutrients[0].amount;
        return calories;  
    }
    catch(err)
    {
        console.log('error getting calories');
    }
}

let dropdowns =document.querySelectorAll(".form-select");
calorie_dict = {};
function printcals(dropwdowns)
{
    dropdowns.forEach((dropdown)=>
    {
        dropdown.addEventListener("change",  async (event) => {
             
            console.log(dropdown.id);
            if(!dropdown.id.includes("servings-dropdown"))
            {
                const selectedOption = event.target.options[event.target.selectedIndex];
                const selectedRecipeName = selectedOption.textContent;
                const row_number = parseInt(dropdown.id.match(/\d+/)[0]);
                const index= titles[row_number-1].findIndex((name)=> name == selectedRecipeName);
                const ID = Idlist[row_number-1].at(index);
                try{
                    cals = await getcals(ID);
                    cals = Math.round(cals);
                    console.log(cals);
                    const box = document.getElementById(`calories ${row_number}`);
                    console.log(box);
                    const servings_box = document.getElementById(`servings-dropdown ${row_number}`);
                    var servings = servings_box.options[servings_box.selectedIndex].textContent;
                    calorie_dict[row_number-1] = cals;
                    if(isNaN(servings))
                    {
                        box.innerHTML = cals + " Calories";
                    }
                    else{
                        box.innerHTML = servings*cals + " Calories";
                    }
                    
                }
                catch(err)
                {
                    console.log("Not able to retrieve Calories");
                }
            }
            else
            {
                    console.log(typeof (dropdown.id));
                    const row = dropdown.id.match(/\d+/); // Use regular expression to match numbers
                    console.log(row);
                    const box = document.getElementById(`calories ${row}`);
                    const option = event.target.options[event.target.selectedIndex];
                    let servings = parseInt(option.textContent);
                    const cals = calorie_dict[row-1];
                    box.innerHTML = cals*servings + " Calories";
            }
            
    
    })
    
    });
}

function createNewRow() {
    const table = document.querySelector('.table-bordered');
    const newRow = document.createElement('tr');
    newRow.className = 'tr-inputs';
    newRow.id = `row${num_buttons+1}`;
    num_buttons++;
    const cellHTML = `
        <th><div><input type="Name" class="data-input"></div></th>
        <th><div><input type="Ingredients" class="data-input"></div></th>
        <th><div><button type="submit-button" class="btn btn-outline-secondary click" id = "${num_buttons}">Search</button></div></th>
        <th type='select dish'><form><select class="form-select overflow-auto" id = "titles ${num_buttons}">
            <option value='' selected disabled>Choose Recipe</option>
        </select></form></th>
        <th type="servings"><form><select class="form-select" id="servings-dropdown ${num_buttons}">
            <option value=''>1</option>
            <option value=''>2</option>
            <option value=''>3</option>
            <option value=''>4</option>
            <option value=''>5</option>
        </select></form></th>
        <th>
        <span id="calories ${num_buttons}"></span>
        </th>
    `;

    newRow.innerHTML = cellHTML;
    table.appendChild(newRow);
};

function deleterow()
{
    const row = document.getElementById(`row${num_buttons}`);
    console.log(Idlist);
    if (row) {
        console.log(calorie_dict);
        delete calorie_dict[row-1];
        if(Idlist.length == num_buttons)
        {
            Idlist.pop();
            titles.pop();
        }
        num_buttons--;
        row.remove();
    }
}

const delete_row = document.getElementById("delete");
delete_row.addEventListener("click",  ()=> {
    deleterow();
    dropdowns =document.querySelectorAll(".form-select");
    printcals();
    displaydata();
});

const add_row = document.getElementById("add");
add_row.addEventListener("click",  ()=> {
    createNewRow();
    dropdowns =document.querySelectorAll(".form-select");
    printcals();
    displaydata();

});

const print_cals = document.getElementById("print-cals");
print_cals.addEventListener("click",  ()=> {
    var total = 0;
    for(let i = 0; i < num_buttons; i++)
    {
        const box = document.getElementById(`calories ${i+1}`);
        total +=parseInt(box.innerHTML);
    }
    const total_box = document.getElementById("total-cals");
    total_box.innerHTML = total + " Calories"
});

printcals();
displaydata();
