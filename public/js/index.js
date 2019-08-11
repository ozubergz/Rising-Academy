
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    if(this.count < 6) {
      return this.count++;
    }
  };
  
  decrement() {
    return this.count--;
  };
  
}

var counter = new Counter();

$("#add-btn").click((e) => {
  const inputs = `
     <div class="form-row" id="newInputs">
        <div class="form-group col-md-4 col-sm-4 col-4">
          <input class="form-control" placeholder="Child's First Name">
        </div>
        <div class="form-group col-md-4 col-sm-4 col-4">
          <input class="form-control" placeholder="Child's Last Name">
        </div>
        <div class="form-group col-md-3 col-sm-3 col-3">
          <select class="form-control">
            <option selected>Grade...</option>
            <option value="kindergarten">Kindergarten</option>
            <option value="1st">1st Grade</option>
            <option value="2nd">2nd Grade</option>
            <option value="1st">3rd Grade</option>
            <option value="2nd">4th Grade</option>
            <option value="1st">5th Grade</option>
            <option value="2nd">6th Grade</option>
            <option value="1st">7th Grade</option>
            <option value="2nd">8th Grade</option>
          </select>
        </div>
        <div class="col-md-1 col-sm-1 col-1">
          <button type="button" id="remove-btn" class="new-btn btn btn-primary"><i class="fas fa-minus"></i></button>
        </div>
      </div>
    `;
    if (counter.increment() < 6) {
      $("#additional-form").append(inputs);
    } else {
      alert('You have reach the limit.');
    }
});

$("#additional-form").on('click', '.new-btn', (e) => {
  counter.decrement();
  $("#newInputs").remove();
});

$('#password, #confirmPassword').on('keyup', () => {
  if($('#password').val() === $('#confirmPassword').val()) {
    $('#confirmPassword').css('border-color', '#9cf196');
    $('#register-submit').attr('disabled', false);
  } else if ($('#password').val() !== $('#confirmPassword').val()) {
    $('#confirmPassword').css('border-color', 'red')
    $('#register-submit').attr('disabled', true);
  }
});

function toggleContent(type) {
  let grades = ["kinder", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eigth"];
  let newGrades = [...grades];
  newGrades.splice(newGrades.indexOf(type), 1);
  $(`.${type}-content`).show()
  $(`.${type}`).css("border", "5px solid #f76262");
  newGrades.forEach(grade => {
    $(`.${grade}-content`).hide();
    $(`.${grade}`).css("border-style", "none");
  });
}

$(".kinder").on('click', () => {
  toggleContent("kinder");
});

$(".first").on("click", ()=> {
  toggleContent("first");
});

$(".second").on("click", ()=> {
  toggleContent("second");
});

$(".third").on("click", () => {
  toggleContent("third");
});

$(".fourth").on("click", () => {
  toggleContent("fourth");
});

$(".fifth").on("click", () => {
  toggleContent("fifth");
});

$(".sixth").on("click", () => {
  toggleContent("sixth");
});

$(".seventh").on("click", () => {
  toggleContent("seventh")
});

$(".eigth").on("click", () => {
  toggleContent("eigth");
});


