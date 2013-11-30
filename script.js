
// ----- триггер для обработки текста после окончания изменений
  
var mainTextArea = $('#text-area textarea');								// определение главного текстового поля
var mainTextSelector = document.querySelector('#text-area > textarea');		// селектор главного текстового поля 

var textBlock = $('#img-text');												// определение текстового блока
var typingTimer; 															// определение таймер набора
var doneTypingInterval = 3000;												// установка интервала таймера для обработки текста

var textLeft 	// местоположение текста слева
var textTop		// местоположение текста сверху

// перезапуск таймера
function rebootTimer () {
    clearTimeout(typingTimer);									// обнуление таймера
    typingTimer = setTimeout(doneTyping, doneTypingInterval);	// установка таймера
}

// начать отсчёт после изменения
if (mainTextSelector.addEventListener) {
	mainTextSelector.addEventListener('input', function() {					// отлов изменеия содержимого текстового поля в обычных браузерах
		rebootTimer ();														// перезапуск таймера
	}, false);
	} else if (mainTextSelector.attachEvent) {
		mainTextSelector.attachEvent('onpropertychange', function() {		// отлов изменеия содержимого текстового поля в IE
			rebootTimer ();													// перезапуск таймера
		});
	}

// выполнить после таймаута
function doneTyping () {
    if (mainTextArea.val() != 0) {		// если поле текста не пустое
		manageText();					// запуск обработки текста
	}
};

// триггер на ввод в главное текстовое поле
mainTextArea.keyup(function(){
	textOffset();				// выставить кординаты текста
});


// ----- получить целое случайное число в диапазоне (используется для получения изображения)
function randomNum(min, max) {
	var num = Math.round(Math.random() * (max - min + min));	// генерировать и округлить число
	return num;													// возврат числа	
}

// ----- обработка текста и вызов выставления изображения и текста
function manageText() {
	var text = mainTextArea.val();		// получение содержимого текстового поля
	var word;							// часть текста в текущем кадре
	var i;								// порядковое число кадра
	
	word = text;						// временно приписиваем всё содержимое текстового поля
	
	setImage(word, i);					// поиск и установка одного изображения
	setText(word, i);					// установка текста
};

// ----- выставление изображения
function setImage(text, imgNum) {
	var imageAPI = 'https://ajax.googleapis.com/ajax/services/search/images?q=' + text + '&v=1.0&callback=?';	// ссылка запроса изображения
	$.getJSON(imageAPI,	function(json) {				// запрос изображения и назначение 
		var imgTag = $('#img-container');					// опредление места под изображение
		var num = randomNum(0, 4);							// случайное число для выбора одного из результата выдачи
		var img = new Image();								// создание эгземпляра изображения

		img.src = json.responseData.results[num].url;		// назначение источника изображения
		imgTag.attr('src', img.src);						// изменение источника отбраженного изображения

		img.onload = function() {							// после того как изображение подгрузилось
			var marginTop = '-' + (imgTag.height() / 2);	// подсчитать отступ сверху для отцентровки блока изображения
			var marginLeft = '-' + (imgTag.width() / 2);	// подсчитать отступ слева для отцентровки блока изображения
			imgTag.css('margin-top', marginTop);			// назначение отступа сверху для отцентровки блока изображения
			imgTag.css('margin-left', marginLeft);			// назначение отступа слева для отцентровки блока изображения
		}
	});
};

// ----- выставление текста
function setText(text, imgNum) {
	textBlock.html(text);				// назначение текста в блок сообщения
	
	textLeft = '-' + (textBlock.width() / 2);		// подсчёт отступа слева для оцентровки блока сообщения
	textTop = '-' + (textBlock.height() / 2);		// подсчёт отступа слева для оцентровки блока сообщения

	textBlock.css('margin-left', textLeft);			// назначение отступа слева для блока сообщения

	textOffset();								// выставить кординаты текста
};



// ----- блок текста на изображении

// определение свойств текстового блока
function moveText(options) {

	var box = options.box;
	var textMsg = box.find('#img-text');

	// при начале переноса фиксируются
	var textCursorShift;	// сдвиг курсора относительно текста
	var imgCoords;			// и координаты картинки

	textMsg.on('mousedown', onTextMouseDown)
		   .on('selectstart dragstart', false);

//	setMovingValue(value, true);
 

	function onTextMouseDown(e) {
		startMoving(e.pageX, e.pageY);
		return false;
	}

	function onDocumentMouseMove(e) { 
		//  вычесть координату родителя, т.к. position: relative
		var newLeft = e.pageX - textCursorShift.x - imgCoords.left;

		// курсор ушёл вне слайдера
		if (newLeft < 0) { newLeft = 0; }

		var rightEdge = box.outerWidth() - textMsg.outerWidth();
		if (newLeft > rightEdge) { newLeft = rightEdge;	}

		var newTop = e.pageY - textCursorShift.y - imgCoords.top

		// курсор ушёл вне слайдера
		if (newTop < 0) { newTop = 0;}

		var bottomEdge = box.outerHeight() - textMsg.outerHeight();
		if (newTop > bottomEdge) { newTop = bottomEdge; }
		setMovingValue( newLeft, newTop ); //Math.round( newTop / pixelsPerValue) );
		
//		alert(bottomEdge);
	}

	function onDocumentMouseUp() {
		endMoving();
	}

	function endMoving() {
		$(document).off('.img');
		$(this).triggerHandler({
			type: "change", 
//			value: value
		});

		box.removeClass('moving');
	}
	
	function startMoving(downPageX, downPageY) {
//		var textCoords = textMsg.offset();

		textCursorShift = { 
			x: downPageX - textLeft,//Coords.left,
			y: downPageY - textTop//Coords.top
		};

		imgCoords = box.offset();

		$(document).on({
			'mousemove.img': onDocumentMouseMove,
			'mouseup.img': onDocumentMouseUp
		});

		box.addClass('moving');
	}

//	Установить промежуточное значение 
//	quiet -- означает "не генерировать событие"
 
	function setMovingValue(newLeftValue, newTopValue, quiet) {
		leftValue = newLeftValue;
		topValue = newTopValue;

		textMsg.css('left', leftValue);// * pixelsPerValue ^ 0);
		textMsg.css('top', topValue);// * pixelsPerValue ^ 0);
		if (!quiet) {
			$(this).triggerHandler({
				type: "move", 
//				value: value
			});
		}
	}

//	Установить окончательное значение
//	@param {number} newValue новое значение
//	@param {boolean} quiet если установлен, то без события

	this.setValue = function(newValue, quiet) {
		// установить значение БЕЗ генерации события move
		// т.е. move в любом случае нет
		setMovingValue(newValue, true);

		// ..а change будет, если не указан quiet
		if (!quiet) {
		  $(this).triggerHandler({
			type: "change", 
//			value: value
		  });
		}
	}

	textOffset();	// выставить кординаты текста
}


// выставить кординаты текста
function textOffset(){
	$('#textX').html(textLeft);			// выставить горизонтальную позицию
	$('#textY').html(textTop);			// выставить вертикальную позицию
};

// определение текстового блока
var msgBlock = new moveText({box: $('#img-box')});

// при перетаскивании текста
$(msgBlock).on({
	move: function(e) {
		textOffset();
	},
	movEnd: function(e) {
//		textOffset();
	}
});



// ----- ползунок времени

// определение свойств ползунка
function Slider(options) {

	var elem = options.elem;
	var thumbElem = elem.find('.slider-thumb');

	// [<*>----------------]
	//   |...............|
	// first            last
	var pixelsPerValue = (elem.width() - thumbElem.width()) / options.max;
	var value = options.value || 0;

	// при начале переноса фиксируются
	var thumbCursorShift; // сдвиг курсора относительно бегунка
	var sliderCoords; // и координаты слайдера

	thumbElem.on('mousedown', onThumbMouseDown)
	.on('selectstart dragstart', false);

	setSlidingValue(value, true);
 

	function onThumbMouseDown(e) {
		startSlide(e.pageX, e.pageY);
		return false;
	}

	function onDocumentMouseMove(e) { 
		//  вычесть координату родителя, т.к. position: relative
		var newLeft = e.pageX - thumbCursorShift.x - sliderCoords.left;

		// курсор ушёл вне слайдера
		if (newLeft < 0) {
			newLeft = 0;
		}

		var rightEdge = elem.outerWidth() - thumbElem.outerWidth();
		if (newLeft > rightEdge) {
			newLeft = rightEdge;
		}

		setSlidingValue( Math.round( newLeft / pixelsPerValue) );    
	}

	function onDocumentMouseUp() {
		endSlide();
	}

	function endSlide() {
		$(document).off('.slider');
		$(this).triggerHandler({
			type: "change", 
			value: value
		});

		elem.removeClass('sliding');
	}
	
	function startSlide(downPageX, downPageY) {
		var thumbCoords = thumbElem.offset();

		thumbCursorShift = { 
			x: downPageX - thumbCoords.left,
			y: downPageY - thumbCoords.top
		};

		sliderCoords = elem.offset();

		$(document).on({
			'mousemove.slider': onDocumentMouseMove,
			'mouseup.slider': onDocumentMouseUp
		});

		elem.addClass('sliding');
	}

//	Установить промежуточное значение 
//	quiet -- означает "не генерировать событие"
 
	function setSlidingValue(newValue, quiet) {
		value = newValue;

		thumbElem.css('left', value * pixelsPerValue ^ 0);
		if (!quiet) {
			$(this).triggerHandler({
				type: "slide", 
				value: value
			});
		}
	}

//	Установить окончательное значение
//	@param {number} newValue новое значение
//	@param {boolean} quiet если установлен, то без события

	this.setValue = function(newValue, quiet) {
		// установить значение БЕЗ генерации события slide
		// т.е. slide в любом случае нет
		setSlidingValue(newValue, true);

	// ..а change будет, если не указан quiet
		if (!quiet) {
		  $(this).triggerHandler({
			type: "change", 
			value: value
		  });
		}
	}

}

// создание ползунка
var slider = new Slider({
  elem: $('#frame-bar'), 
  max: 100,
  value: 0
})

// при перетаскивании ползунка
$(slider).on({
	slide: function(e) {
		$('#slide').html(e.value);
	},
	change: function(e) {
		$('#change').html(e.value);
	}
});