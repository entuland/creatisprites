function mainIndex() {
	
	function appendIcon(sprite, parent) {

		var icon = document.createElement('div');
		icon.innerHTML = '&nbsp;';
		var container = document.createElement('div');		
		
		icon.style.backgroundImage = 'url(img/icons_' + sprite.s + '.jpg)';
		container.style.backgroundImage = 'url(img/icons_' + sprite.s + '.jpg)';
		
		
		var x = sprite.x;
		var	y = 4096 - sprite.y - sprite.h;
		if(sprite.s === "01") {
			y = 1024 - sprite.y - sprite.h;
		}
		var off = 14;
		
		icon.style.backgroundPosition = '-' + x + 'px -' + y + 'px';
		container.style.backgroundPosition = '-' + (x + off) + 'px -' + (y + off) + 'px';

		container.appendChild(icon);
		icon.classList.add('icon');
		var internal = sprite.i;
		var visible = sprite.v

		icon.title = visible + ', icons_' + sprite.s + ', index ' + sprite.id + ' (Click to add to the output textarea)';
		container.classList.add('container');
		icon.dataset.index = sprite.id;
		icon.dataset.set = sprite.s;
		icon.dataset.visible = visible;
		icon.dataset.internal = internal;
		parent.appendChild(container);
		
		icon.addEventListener('click', function() {
			if(document.querySelector('#outputname').checked) {
				output.value += this.dataset.visible + ' ';
			}
			var i = parseInt(this.dataset.index);
			if(document.querySelector('#useindices').checked) {
				output.value += '<sprite="icons_' + this.dataset.set + '" index=' + i + '>';
			} else {
				output.value += '<sprite="icons_' + this.dataset.set + '" name="' + this.dataset.internal + '">';
			}
			if(document.querySelector('#appendspace').checked) {
				output.value += ' ';
			}			
		});
		container.dataset.search_name = internal.toLowerCase() + " " + visible.toLowerCase();
	}

	function createGrid() {
		for(var i in icondata) {
			appendIcon(icondata[i], picker);				
		}
	}

	function createTable() {
		for(var i in icondata) {
			var sprite = icondata[i];
			
			var tr = document.createElement('tr');
			var iconsetCell = document.createElement('td');
			var indexCell = document.createElement('td');
			var inameCell = document.createElement('td');
			var vnameCell = document.createElement('td');
			var iconCell = document.createElement('td');
			
			iconsetCell.innerText = sprite.s;
			indexCell.innerText = sprite.id;
			var internal = sprite.i;
			var visible = sprite.v;

			inameCell.innerText = internal;	
			vnameCell.innerText = visible;	
			
			tr.appendChild(iconsetCell);
			tr.appendChild(indexCell);
			tr.appendChild(inameCell);
			tr.appendChild(vnameCell);
			tr.appendChild(iconCell);
			
			list.appendChild(tr);
			
			appendIcon(sprite, iconCell);
			tr.dataset.search_name = internal.toLowerCase() + " " + visible.toLowerCase();
		}
	}

	function deferredFilter() {
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			var lower = '';
			if(filter.value) {
				lower = filter.value.toLowerCase();				
			}
			var containers = Array.from(document.querySelectorAll('.container'));
			var rows = Array.from(document.querySelectorAll('tr'));
			var elements = containers.concat(rows);
			for(var i = 0; i < elements.length; ++i) {
				var el = elements[i];
				if(!filter.value || el.dataset.search_name.indexOf(lower) != -1) {
					el.style.display = '';
				} else {
					el.style.display = 'none';
				}
			}
		}, 500);
	}

	var picker = document.querySelector('#picker');
	var output = document.querySelector('#output');
	var list = document.querySelector('#list');
	output.addEventListener('focus', function() {
		this.select();
	});

	var tablemode = false;

	var switcher = document.querySelector('#switch');

	switcher.addEventListener('click', function() {
		if(tablemode) {
			list.style.display = 'none';
			picker.style.display = 'block';
			switcher.innerText = 'Switch to List View';
		} else {
			list.style.display = 'block';
			picker.style.display = 'none';
			switcher.innerText = 'Switch to Grid View';
		}
		tablemode = !tablemode;
	});

	createGrid();
	createTable();

	var timeout = 0;

	var filter = document.querySelector('#filter');

	filter.addEventListener('input', deferredFilter);
}

window.addEventListener('load', mainIndex);
