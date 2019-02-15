const budgetController = (() => {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }

    calcPercentage(totalIncome) {
      this.percentage =
        totalIncome > 0 ? Math.round((this.value / totalIncome) * 100) : -1;
    }

    get getPercentage() {
      return this.percentage;
    }
  }

  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  const calculateTotal = type => {
    let sum = 0;
    data.allItems[type].forEach(el => {
      sum += el.value;
    });
    data.totals[type] = sum;
  };

  return {
    addItem: (type, des, val) => {
      let newItem;
      let ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);

      return newItem;
    },
    deleteItem: (type, id) => {
      const ids = data.allItems[type].map(current => current.id);
      const index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: () => {
      calculateTotal('exp');
      calculateTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: () => {
      data.allItems.exp.forEach(el => {
        el.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: () => {
      const allPerc = data.allItems.exp.map(el => el.getPercentage);
      return allPerc;
    },
    getBudget: () => ({
      budget: data.budget,
      totalInc: data.totals.inc,
      totalExp: data.totals.exp,
      percentage: data.percentage,
    }),
  };
})();

const UIController = (() => {
  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dataLabel: '.budget__title--month',
  };

  const formatNumber = (num, type) => {
    let formatedNum = Math.abs(num);
    formatedNum = num.toFixed(2);
    const numSplit = formatedNum.split('.');
    let int = numSplit[0];
    if (int.length > 3) {
      int = `${int.substr(0, int.length - 3)},${int.substr(
        int.length - 3,
        int.length
      )}`;
    }
    const dec = numSplit[1];

    return `${type === 'exp' ? '-' : '+'} ${int}.${dec}`;
  };

  const nodeListForEach = (list, callback) => {
    for (let i = 0; i < list.length; i += 1) {
      callback(list[i], i);
    }
  };

  return {
    getInput: () => ({
      type: document.querySelector(DOMstrings.inputType).value,
      description: document.querySelector(DOMstrings.inputDescription).value,
      value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
    }),
    addListItem: (obj, type) => {
      let html;
      let newHtml;
      let element;

      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = `<div class="item" id="inc-%id%">
                    <div class="item__description">%description%</div>
                    <div class="item--right">
                        <div class="item__value">%value%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = `<div class="item" id="exp-%id%">
                    <div class="item__description">%description%</div>
                    <div class="item--right">
                        <div class="item__value">%value%</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`;
      }

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem: selectorID => {
      const el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: () => {
      const fields = document.querySelectorAll(
        `${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`
      );
      const fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(el => {
        el.value = '';
      });
      fieldsArr[0].focus();
    },
    displayBudget: obj => {
      const type = obj.budget > 0 ? 'inc' : 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, 'exp');
      document.querySelector(DOMstrings.percentageLabel).textContent =
        obj.percentage > 0 ? `${obj.percentage}%` : '---';
    },
    displayPercentages: percentages => {
      const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, (current, index) => {
        current.textContent =
          percentages[index] > 0 ? `${percentages[index]}%` : '---';
      });
    },
    displayMonth: () => {
      const now = new Date();
      const month = now.getMonth();
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const year = now.getFullYear();
      document.querySelector(DOMstrings.dataLabel).textContent = `${
        months[month]
      }, ${year}`;
    },
    changedType: () => {
      const fields = document.querySelectorAll(
        `${DOMstrings.inputType},
        ${DOMstrings.inputDescription},
        ${DOMstrings.inputValue}`
      );

      nodeListForEach(fields, cur => {
        cur.classList.toggle('exp-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('exp');
    },
    getDOMstrings: () => DOMstrings,
  };
})();

const controller = ((budgetCtrl, UICtrl) => {
  const DOM = UICtrl.getDOMstrings();

  const updateBudget = () => {
    budgetCtrl.calculateBudget();
    const budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    budgetCtrl.calculatePercentages();
    const percentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = () => {
    const input = UICtrl.getInput();

    // eslint-disable-next-line no-restricted-globals
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      const newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );

      UICtrl.addListItem(newItem, input.type);

      UICtrl.clearFields();
      document.querySelector(DOM.inputBtn).blur();

      updateBudget();
      updatePercentages();
    }
  };

  const ctrlDeleteItem = event => {
    const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      const splitID = itemID.split('-');
      const type = splitID[0];
      const ID = parseInt(splitID[1]);

      budgetCtrl.deleteItem(type, ID);
      UICtrl.deleteListItem(itemID);
      updateBudget();
      updatePercentages();
    }
  };

  const setupEventListeners = () => {
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', event => {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changedType);
  };

  return {
    init: () => {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
