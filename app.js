/**
 * BUDGET CONTROLLER
 */
// controller słuzy do oddzielania danych - obiektowo, stworzone sa z ifee co zapewnia prywatnosc danyh jezeli tego chcemy
var budgetController = (function () {

    // function constructor - tworzymy 2 konstruktory obiektów dla wydatkow i przychodów
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

    // calculate total - prywatra funkcja zwracajaca w calculate budget

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(currenElement) {
            sum += currenElement.value;
        });

        data.totals[type] = sum;
    };

    // tworzymy strukture danych. przechowywanych w zagnieżdzonym obiekcie,
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
        percentage: -1 // -1 jest wartoscia ktorej uzywamy gdy cos nie istnieje
    };

    //zwracamy obiekt (ktorego dany beda dostepny na zewnatrz === BO MA FUNKCJE ktore maja z parametrach dostep do danych powyzej)
    return {

        addItem: function(type, des, val) {
            var newItem, ID;

            // sposob na utworzenie unikalnego id bez problemow z usuwaniem elementow i kolizji z ich iloscia
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id +1;
            }else {
                ID = 0;
            }

            // sprawdzamy typ i w zaleznosci od niego tworzymy nowy obiekt przychodów lub wydatków
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //do obiektu z danymi w zaleznosci od typu!!! pushujemy stworzony obiekt i go zwracamy
            data.allItems[type].push(newItem);
            return newItem;

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

//kontroler od interakcji i interfejsem (stworzony jak KAŻDY kontroler z wykorzystaniem IFEE )
var UIController = (function () {

    // tworzymy obiekt w ktorym klucz-wartosc stanowią klasy z html - w ten sposob bedzie ich sie uzywac latwiej i jest to bardzo DRY
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
        percentageLabel: '.budget__expenses--percentage'
    };

    // zwracamy obiekt z funkcjami- by przekazac to potem dalej!!!
    return {
        getInput: function () {

            // zwracamy obiekt z wybraniem elementow dom. dry i łatwosc i uzywaniu!!!
            return {
                type: document.querySelector(DOMStrings.inputType).value, // will be for income and expenses
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
                inputBtn: document.querySelector(DOMStrings.inputBtn)
            };
        },
        // zwracamy na zewnatrz  funkcje z klasami html
        getDOMStrings: function() {
            return DOMStrings;
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;

            if(type === 'inc') {
                html = '<div class="item" id="income-%id%">'+
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
                html = '<div class="item" id="expense-%id%">' +
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

            // uzycie prototypu by wywolac metode tablicy na liscie
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(element) {
               element.value = "";
            });
            // ustawiamy focus spowrotem na 1 element
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

// globalny kontroler sluzacy do przekazywania danych miedzy kontrolerami a takze do przekazywania event listenerow
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

controller.init();
