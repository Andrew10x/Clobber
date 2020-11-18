'use strict';

const comp_btn = document.getElementById('comp_btn');

comp_btn.onclick = computer;

const field_arr = new Array(6);
for (let i = 0; i < 6; i++)
    field_arr[i] = new Array(5);

let number_of_black_moves = 0;
let my_turn = true;
let selected = false;
let first_sel = {
    x: -1,
    y: -1
};

function draw_field() {
    let field = document.querySelector('.field');
    let cell;
    let flag = true;

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            cell = document.createElement('a');
            cell.className = 'sell';
            cell.id = 'sell' + i + '_' + j;
            cell.href = 'javascript:clicked(' + i + ', ' + j + ')';
            field.appendChild(cell);

            let img = document.createElement('img');
            img.className = 'cell-img';
            img.name = 'space' + i + '' + j;

            if (flag) {
                img.src = 'img/ww.png';
                let obj = {
                    cell_color: 'w',
                    fig_color: 'w',
                    selected: false
                };
                field_arr[i][j] = obj;
            }
            else {
                img.src = 'img/bb.png';
                let obj = {
                    cell_color: 'b',
                    fig_color: 'b',
                    selected: false
                };
                field_arr[i][j] = obj;
            }
            cell.appendChild(img);
            flag = !flag;
        }
    }
}

draw_field();

function clicked(i, j) {

    if(my_turn)
    toggle(i, j);




}


function toggle(x, y) {

    let obj = field_arr[x][y];

    if (my_turn) {
        if (obj.fig_color == '') //клетка пуста
            return false;
        if (my_turn && selected == false && obj.fig_color == 'b') //хотим ходить не нашей клеткой
            return false;
        if (!my_turn && selected == false && obj.fig_color == 'w') //хотим ходить не нашей клеткой
            return false;
        if (obj.selected == false && selected == false) {  //ничего не выбрано
            let path = obj.fig_color + obj.cell_color + 'sel.png';
            draw(x, y, path);
            selected = true;
            field_arr[x][y].selected = true;

            first_sel.x = x;
            first_sel.y = y;
        }
        else if (first_sel.x == x && first_sel.y == y) { //нажимаем на уже выбранную клетку
            let path = obj.fig_color + obj.cell_color + '.png';
            draw(x, y, path);
            selected = false;
            field_arr[x][y].selected = false;

            first_sel.x = -1;
            first_sel.y = -1;
        }
        else if (selected == true) { // если одна клетка уже выбрана
            if (Math.abs(x - first_sel.x) > 0 && Math.abs(y - first_sel.y) > 0) // проверка
                return false;                                                        // правильности хода

            if (Math.abs(x - first_sel.x) > 1 || Math.abs(y - first_sel.y) > 1)
                return false;

            if (field_arr[first_sel.x][first_sel.y].fig_color != field_arr[x][y].fig_color) {
                //если пешки разные
                let path = obj.fig_color + obj.cell_color + 'sel.png';
                draw(x, y, path);

                move(x, y);
                selected = false;
                field_arr[first_sel.x][first_sel.y].selected = false;
                first_sel.x = -1;
                first_sel.y = -1;
                my_turn = !my_turn;
            }
        }
    }


    else {  //ходит компьютер

        if (selected == false) {  //ничего не выбрано
            let path = obj.fig_color + obj.cell_color + 'sel.png';
            draw(x, y, path);
            selected = true;
            field_arr[x][y].selected = true;

            first_sel.x = x;
            first_sel.y = y;
        }
        else { // если одна клетка уже выбрана

            let path = obj.fig_color + obj.cell_color + 'sel.png';
            draw(x, y, path);

           
            move(x, y);
            selected = false;
            field_arr[first_sel.x][first_sel.y].selected = false;
            first_sel.x = -1;
            first_sel.y = -1;
            my_turn = !my_turn;
        }
    }
}

//если не выделенная - выделяет, если выделенная - уберает выделение
function draw(x, y) {
    let path0 = document.images['space' + x + '' + y].src;
    let sel_pos = path0.indexOf('sel');
    let path1 = '';
    if (sel_pos == -1)
        path1 = path0.slice(0, path0.indexOf('.png')) + 'sel.png';
    else
        path1 = path0.slice(0, sel_pos) + '.png';

    document.images['space' + x + '' + y].src = path1;
}

// path like 'ww.png' ставит желаемую картинку на нужную позицию 
function draw(x, y, path) {

    let new_path = 'img/' + path;
    document.images['space' + x + '' + y].src = new_path;
}

function move(x, y) {
    let path1 = field_arr[first_sel.x][first_sel.y].fig_color +
        field_arr[x][y].cell_color + '.png';
    draw(x, y, path1);
    field_arr[x][y].fig_color = field_arr[first_sel.x][first_sel.y].fig_color;

    let path2 = '';
    if (field_arr[first_sel.x][first_sel.y].cell_color == 'w')
        path2 = 'white.png';
    else
        path2 = 'black.png';

    draw(first_sel.x, first_sel.y, path2);
    field_arr[first_sel.x][first_sel.y].fig_color = '';
}

// ходит компьютер
function computer() {

    if (number_of_black_moves < 7) {
        let flag = false;
        number_of_black_moves++;
        for (let i = 0; i < 10; i++) {
            if (rand_moves()) {
                flag = true;
                break;
            }
        }
        if (flag) return;

        if (!extra_rand_moves()) alert(`White's won!!!`);
    }
    else {
        alert("Danger");
        let our_tree = new Tree();
        let in_state = obj_to_arr();
        our_tree.create_tree(in_state);

        let best_move = our_tree.get_best_move_arr(); //сделать проверку, что это не терминальное состояние
        make_move(in_state, best_move);
    }
}

// рандомные ходы
function rand_moves() {

    let x = rand_int(0, 5);
    let y = rand_int(0, 4);

    return comp_moves(x, y);
}

// рандомные ходы полным перебором
function extra_rand_moves() { // доделать
    let x = rand_int(0, 5);

    for (let i = x; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            if (comp_moves(i, j)) return true;
        }
    }
    for (let i = 0; i < x; i++) {
        for (let j = 0; j < 5; j++) {
            if (comp_moves(i, j)) return true;
        }
    }
    return false;
}

// сам ход
function comp_moves(x, y) {

    if (field_arr[x][y].fig_color == 'b') {
        if (x - 1 >= 0 && field_arr[x - 1][y].fig_color == 'w') {
            toggle(x, y);
            pause();
          
            toggle(x - 1, y);
        }
        else if (y - 1 >= 0 && field_arr[x][y - 1].fig_color == 'w') {
            toggle(x, y);
            pause();
          
            toggle(x, y - 1);
        }
        else if (x + 1 < 6 && field_arr[x + 1][y].fig_color == 'w') {
            toggle(x, y);
            pause();
           
           toggle(x + 1, y);
        }
        else if (y + 1 < 5 && field_arr[x][y + 1].fig_color == 'w') {
            toggle(x, y);
            pause();
           
            toggle(x, y + 1);
        }
        else return false;
    }
    else return false;

    return true;
}

function check_state() {  // переделать

    let flag = false;
    if (field_arr[x][y].fig_color == 'w') {
        if (x - 1 >= 0 && field_arr[x - 1][y].fig_color == 'b') {
            flag = true;
        }
        else if (y - 1 >= 0 && field_arr[x][y - 1].fig_color == 'b') {
            flag = true;
        }
        else if (x + 1 < 6 && field_arr[x + 1][y].fig_color == 'b') {
            flag = true;
        }
        else if (y + 1 < 5 && field_arr[x][y + 1].fig_color == 'b') {
            flag = true;
        }
        else return false;
    }
    else return false;

    return flag;
}

// рандомное число
function rand_int(min, max) {
    // случайное число от min до (max+1)
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

function pause() {
    let a = 1;
    for (let i = 1; i < 100000; i++)
        a = Math.sin(1);
}




// Tree

class Node {
    constructor(state) {
        this.state = state;
        this.children = [];
        this.value = 0; //
        this.alpha = -10;
        this.beta = 10;
    }
}


const i_l = 6;
const j_l = 5;

class Tree {
    constructor() {
        this.root = null;
    }
    // state это массив

    create_tree(state) {

        this.root = new Node(state);
        this.find_child(state, this.root, false);
        this.alpha_beta(this.root, false, this.root.alpha, this.root.beta);

    }

    find_child(state, cur_node, fut_my_turn) {

        let obj = {
            x1: null,
            y1: null,
            x2: null,
            y2: null
        };

        //поиск всех доступных решений и их передача на добавление к детям
        for (let i = 0; i < i_l; i++) {
            for (let j = 0; j < j_l; j++) {

                if (state[i][j] != 0) {
                    if (i + 1 < i_l && state[i + 1][j] != state[i][j] && state[i + 1][j] != 0) {
                        obj.x1 = i; obj.y1 = j; obj.x2 = i + 1; obj.y2 = j;
                        let new_node = this.create_children(obj, state, cur_node, fut_my_turn);

                        this.find_child(new_node.state, new_node, !fut_my_turn);
                    }
                    else if (j + 1 < j_l && state[i][j + 1] != state[i][j] && state[i][j + 1] != 0) {
                        obj.x1 = i; obj.y1 = j; obj.x2 = i; obj.y2 = j + 1;
                        let new_node = this.create_children(obj, state, cur_node, fut_my_turn);

                        this.find_child(new_node.state, new_node, !fut_my_turn);
                    }
                }
            }
        }
    }

    create_children(obj, state, cur_node, fut_my_turn) {
        //создаем копию массива
        let child_arr = new Array(i_l);

        for (let i = 0; i < i_l; i++) {
            child_arr[i] = state[i].slice();
        }

        //делаем ход в зависимости от очереди
        if (fut_my_turn) {
            if (child_arr[obj.x1][obj.y1] == 1) {
                child_arr[obj.x1][obj.y1] = 0;
                child_arr[obj.x2][obj.y2] = 1;
            }
            else {
                child_arr[obj.x1][obj.y1] = 1;
                child_arr[obj.x2][obj.y2] = 0;
            }
        }
        else {
            if (child_arr[obj.x1][obj.y1] == -1) {
                child_arr[obj.x1][obj.y1] = 0;
                child_arr[obj.x2][obj.y2] = -1;
            }
            else {
                child_arr[obj.x1][obj.y1] = -1;
                child_arr[obj.x2][obj.y2] = 0;
            }
        }

        //добавляем к детям текущего состояния
        let child_node = new Node(child_arr);
        cur_node.children.push(child_node);

        return child_node; //check??
    }

    //если я играю белыми - хожу первым //alpha & beta от родителей
    alpha_beta(cur_node, fut_my_turn, alpha, beta) {
        if (cur_node.children.length === 0) {
            if (fut_my_turn) {
                cur_node.alpha = -1; cur_node.beta = beta;
                cur_node.value = -1;
                return -1;
            }
            else {
                cur_node.beta = 1; cur_node.alpha = alpha;
                cur_node.value = 1;
                return 1;
            }
        }

        let my_eval = -1;
        cur_node.alpha = alpha;
        cur_node.beta = beta;
        if (fut_my_turn) {
            let max_eval = -10;
            for (let i = 0; i < cur_node.children.length; i++) {
                my_eval = this.alpha_beta(cur_node.children[i], !fut_my_turn, cur_node.alpha, cur_node.beta);
                max_eval = Math.max(my_eval, max_eval);

                cur_node.alpha = Math.max(cur_node.alpha, my_eval);
                if (cur_node.beta <= cur_node.alpha) break;
            }
            cur_node.value = max_eval;
            return max_eval;
        }
        else {
            let min_eval = 10;
            for (let i = 0; i < cur_node.children.length; i++) {
                my_eval = this.alpha_beta(cur_node.children[i], !fut_my_turn, cur_node.alpha, cur_node.beta);
                min_eval = Math.min(my_eval, min_eval);

                cur_node.beta = Math.min(cur_node.beta, my_eval);
                if (cur_node.beta <= cur_node.alpha) break;
            }
            cur_node.value = min_eval;
            return min_eval;
        }
    }

    get_best_move_arr() {
        for (let i = 0; i < this.root.children.length; i++) {
            if (this.root.beta == this.root.children[i].alpha)
                return this.root.children[i].state;
        }
    }
}


function obj_to_arr() {
    let new_arr = new Array(6);
    for (let i = 0; i < 6; i++)
        new_arr[i] = new Array(5);

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            let fig = field_arr[i][j].fig_color;
            if (fig == '')
                new_arr[i][j] = 0;
            else if (fig == 'w')
                new_arr[i][j] = 1;
            else if (fig == 'b')
                new_arr[i][j] = -1;
        }
    }

    return new_arr;
}

function make_move(beg_state, end_state) {

    let x1, y1, x2, y2;
    for (let i = 0; i < i_l; i++) {
        for (let j = 0; j < j_l; j++) {
            if (beg_state[i][j] != end_state[i][j]) {
                if (beg_state[i][j] == -1) {
                    x1 = i; y1 = j;
                }
                if (beg_state[i][j] == 1) {
                    x2 = i; y2 = j;
                }
            }
        }
    }

    toggle(x1, y1);
    toggle(x2, y2);
}

//let in_state = [[1, 0, -1],
//[-1, 0, 1],
//[1, -1, -1]];

//let in_state = [[1, -1, 1], [1, 0, 0], [0, 0, 0]];

//let our_tree = new Tree();
//our_tree.create_tree(in_state);
//console.log(our_tree);

