
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
        <div class="form-group col-md-8 col-sm-8 col-8">
          <input class="form-control" name="student_name" placeholder="Child's First Name">
        </div>
        <div class="form-group col-md-3 col-sm-3 col-3">
          <select name="grade" class="form-control">
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

  if ($('#password').val().length > 8) {
    $('.valid-pass').css('color', 'green');
  } else {
    $('.valid-pass').css('color', '#6e2142');
  }

  if ($('#password').val() === $('#confirmPassword').val() && $('#password').val().length > 8) {
    $('#confirmPassword').css('border-color', '#9cf196');
    $('#register-submit').attr('disabled', false);
  } else if ($('#password').val() !== $('#confirmPassword').val()) {
    $('#confirmPassword').css('border-color', 'red');
    $('#register-submit').attr('disabled', true);
  }
});

$(".collapse-btn").click(function() {
  $(this).find('.fa').toggleClass('fa-plus fa-minus')
});

$(".circle").on('click', function() {

  //toggle border-style circle
  $(this).css("border", "5px solid #f76262");
  $(this).siblings("div").css("border", "none")

  //toggle hide or show
  let target = $(this).data('linked');
  $(target).siblings("div").hide();
  $(target).collapse('show');
});

//page reloads to the top of the page
$(window).on('beforeunload', function () {
  $(this).scrollTop(0);
});

//load images
$(window).on("load", function() {
  const img1 = new Image();
  $(img1).attr({
    src: 'public/images/math.png',
    class: "card-img-top",
    alt: "Card geometry image"
  });
  $('.img1').append(img1);

  const img2 = new Image();
  $(img2).attr({
    src: "public/images/teach.png",
    alt: "Card teach image",
    class: "card-img-top"
  });
  $('.img2').append(img2);

  const img3 = new Image();
  $(img3).attr({
    src: "public/images/book-boy.png",
    class: "card-img-top",
    alt: "Card Boy Reading image"
  });
  $('.img3').append(img3);

});