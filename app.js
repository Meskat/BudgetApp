/**
 * BUDGET CONTROLLER
 */

//controller splits data for separate logical parts
var budgetController = (function () {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(currenElement) {
            sum += currenElement.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {

        addItem: function(type, des, val) {
            var newItem, ID;

            // create special id to items in the array
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id +1;
            }else {
                ID = 0;
            }

            // checking the type to create new item with proper type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;

        },

        deleteItem: function(type, id) {

            // example of using map method to loop over the array - map method returns new array
            ids = data.allItems[type].map(function(currentElement) {
                return currentElement.id;
            });

            index = ids.indexOf(id);

            if (index !== -1 ) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // calculate total inc/exp
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate budget incom- exp
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percetage of exp
            if (data.totals.inc > 0 ) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          }
        },

        testing: function () {
            console.log("data structure", data);
        }
    };
})();

/**
 * UI CONTROLLER
 */

//controller to communicate with interface
var UIController = (function () {

    // create object with HTML selector
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };


    return {
        getInput: function () {

            return {
                // return object with html selectors - DRY way of communicating with DOM
                type: document.querySelector(DOMStrings.inputType).value, // will be for both income and expenses
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
                inputBtn: document.querySelector(DOMStrings.inputBtn)
            };
        },

        // passing function (to global controller) with html selectors
        getDOMStrings: function() {
            return DOMStrings;
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            if(type === 'inc') {
                html = '<div class="item" id="inc-%id%">'+
                    '<div class="item__description">%description%</div>'+
                    '<div class="budget__flex-container">'+
                    '<div class="item__value">+ %value%</div>'+
                    '<div class="item__delete">'+
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+
                    '</div>'+
                    '</div>'+
                    '</div>';

                element = document.querySelector(DOMStrings.incomeContainer);
            }else if (type === 'exp') {
                html = '<div class="item" id="exp-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="budget__flex-container">' +
                    '<div class="item__value">- %value%</div>' +
                    '<div class="item__percentage">21%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                element = document.querySelector(DOMStrings.expensesContainer);
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            element.insertAdjacentHTML('beforeend', newHtml);
            //html.replace('%procentage%', obj.procentage);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            // example of using prototype
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(element) {
               element.value = "";
            });
            // setting focus back for the first element
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = "+ " + obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = "- " + obj.totalExp;

            if (obj.percentage >0 ) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "\u2014";
            }
        }
    }
})();

/**
 * GLOBAL APP CONTROLLER
 */

// global controller for managing data between components
var controller = (function (budgetCtrl, UICtrl) {

    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13){
                console.log('enter');
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function() {
      // 1. calculate the budget
      budgetCtrl.calculateBudget( );
      //2. return the budget
        var budget = budgetCtrl.getBudget();
      //3. display the budget on the ui
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function() {

        //deklarowanie przed nadaniem wartosci jest wazne dla HOISTINGU!!!
        var input, newItem;

        // 1. get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add the new item to the user interface
            UICtrl.addListItem(newItem, input.type);
            // 3.1 clear fields
            UICtrl.clearFields();
            // 4. calculate  and upda budget
            updateBudget();
        }
    };

    var ctrlDeleteItem = function(event) {
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID.match("inc || exp")) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. delete the item from the ui

            // 3 update and show new budget
        }
    };

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp:  0,
                percentage: -1});
            setUpEventListeners();
        }
    }

})(budgetController, UIController);

controller.init(); // app start!
