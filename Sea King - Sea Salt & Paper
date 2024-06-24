// ==UserScript==
// @name         Sea King - Sea Salt & Paper
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  try to take over the world!
// @author       Me
// @match        *://boardgamearena.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=boardgamearena.com
// @grant        none
// ==/UserScript==

//thx https://greasyfork.org/ru/scripts/406492-bga-pythia-7-wonders-game-helper/code


// System variables
const Enable_Logging = false;
const Is_Inside_Game = /\?table=[0-9]*/.test(window.location.href);
const clog_status = true;
const url = "https://ssp-familoff.turso.io/v2/pipeline";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MTc1ODQwODAsImlkIjoiNzNkMGE2NjYtNWQzMi00NDRhLWI5NDYtOGE3NjUwNDhmZjdlIn0.aCu9BG6IYen5N6pktMxaIyV5hy26OiHe6GAg3-6aF4-9ZUV2DzZVCGvap1SFXDyQAktIsN_h2aVVekarZC3CAw";

// const Game_Cards= window.parent.gameui.cardsManager;
// Связка с БД
const dbClient = {
    url: url,
    authToken: authToken,

    executeSQL: function (ssql) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.url, false); // false for synchronous request
        xhr.setRequestHeader("Authorization", `Bearer ${this.authToken}`);
        xhr.setRequestHeader("Content-Type", "application/json");

        const body = JSON.stringify({
            requests: [
                { type: "execute", stmt: { sql: ssql } },
                { type: "close" },
            ],
        });

        try {
            xhr.send(body);
            if (xhr.status !== 200) {
                throw new Error(`Error: ${xhr.status}: ${xhr.statusText}`);
            }

            const data = JSON.parse(xhr.responseText);
            return data.results[0].response.result;
        } catch (err) {
            console.error('Database Error:', err);
            throw err;
        }
    },

    // CRUD operations

    create: function (table_id, players_hand, discards1, discards2) {
        const sql = `INSERT INTO kssp_data (table_id, players_hand, discards1, discards2) VALUES ('${table_id}', '${JSON.stringify(players_hand)}', '${JSON.stringify(discards1)}', '${JSON.stringify(discards2)}')`;
        return this.executeSQL(sql);
    },

    read: function (table_id) {
        const sql = `SELECT * FROM kssp_data WHERE table_id='${table_id}'`;
        const result = this.executeSQL(sql);
        if (result && result.rows.length > 0) {
            const row = result.rows[0];
            return this._parseRow(row);
        }
        return null;
    },

    readByTableId: function (table_id) {
        const sql = `SELECT * FROM kssp_data WHERE table_id='${table_id}'`;
        const result = this.executeSQL(sql);
        if (result && result.rows.length > 0) {
            const row = result.rows[0];
            return this._parseRow(row);
        }
        return null;
    },

    update: function (table_id, data) {
        const setClause = Object.entries(data)
            .map(([key, value]) => `${key}='${typeof value === 'object' ? JSON.stringify(value) : value}'`)
            .join(', ');
        const sql = `UPDATE kssp_data SET ${setClause} WHERE table_id='${table_id}'`;
        return this.executeSQL(sql);
    },

    delete: function (table_id) {
        const sql = `DELETE FROM kssp_data WHERE table_id='${table_id}'`;
        return this.executeSQL(sql);
    },

    _parseRow: function (row) {
        return {
            id: row[0].value,
            table_id: row[1].value,
            players_hand: JSON.parse(row[2].value),
            discards1: JSON.parse(row[3].value),
            discards2: JSON.parse(row[4].value)
        };
    }
};

// Main kssp object
var kssp = {
    isStarted: false,
    isFinished: false,
    dojo: null,
    game: null,
    playersCount: 0,
    players: [],
    kssp_discards1: [],
    kssp_discards2: [],
    enemy_hand: {},
    thisTableID: null,

    // Init
    init: function () {
        this.isStarted = true;
        console.log("WORK WORK WORK")
        //Check if the site was loaded correctly
        if (!window.parent || !window.parent.dojo || !window.parent.gameui.gamedatas) {
            return;
        }
        this.dojo = window.parent.dojo;
        this.game = window.parent.gameui.gamedatas;
        this.thisTableID = window.parent.gameui.table_id;
        this.cardgame = window.parent.gameui.cardsManager.game;
        this.COLORS = window.parent.gameui.cardsManager.COLORS;
        this.colodHEX = {
            0: '#FFE4E1', // Белый', // #e1f4f6
            1: '#0000FF', // Тёмно-синий',
            2: '#63c5cf', // Голубой',
            3: '#000000', // Чёрный',
            4: '#eab616', // Жёлтый',
            5: '#008000', // Зелёный',
            6: '#8000FF', // Фиолетовый',
            7: '#7e8486', // Серый',
            8: '#eeab77', // Светло-оранжевый',
            9: '#e98da5', // Розовый',
            10: '#e97d3f' // 'Оранжевый'
        };
        this.category_family = {
            1: {
                0: 'Русалка'
            },
            2: {
                1: 'Краб',
                2: 'Лодка',
                3: 'Рыба',
                4: 'Пловец',
                5: 'Акула',
                6: 'Медуза',
                7: 'Лобстер'
            },
            3: {
                1: 'Раковина',
                2: 'Осьминог',
                3: 'Пингвин',
                4: 'Моряк'
            },
            4: {
                1: 'Маяк',
                2: 'Косяк рыб',
                3: 'множ. пингв.', //Колония пингвинов
                4: 'Капитан',
                5: 'множ. крабов' //Состав крабов
            },
            5: {
                1: 'Звезда', //Морская звезда
                2: 'Конёк' // Морской конёк
            }
        };
        this.edition = parseInt(this.game.game_edition);
        this.isNewEdition = this.edition == 1;

        var activePlayers = this.cardgame.playersTables;
        this.playersCount = this.cardgame.playersTables.length;
        this.activePlayerID = this.game.gamestate.active_player;

        this.renderMenu();
        this.renderLogOn();

        // Поле руки игроков
        for (var i = 0; i < this.playersCount; i++) {
            let playerID = activePlayers[i].playerId;
            //
            this.enemy_hand[playerID] = [];
            //
            this.dojo.place('<div id="enemy_' + playerID + '_hand">Карты на руке:<ul id="enemy_' + playerID + '_cards"></ul></div>', "player_board_" + playerID, "last");
        }
        this.dojo.place('<div id="recDiscards" style="margin-right: 10px; height: 100%;background: white;"><b>Сброс 1</b>:<ul id="discard_1"></ul></br><b>Сброс 2</b>:<ul id="discard_2"></ul></div>', "centered-table", "first");

        // Начало игры
        // Get DiscardCards
        if (this.game.discardTopCard1 && this.game.discardTopCard2) {
            // Arr
            this.kssp_discards1.push(this.game.discardTopCard1);
            this.kssp_discards2.push(this.game.discardTopCard2);
            if (clog_status) { console.log("Сброс 1", this.kssp_discards1); console.log("Сброс 2", this.kssp_discards2) }
            //
            this.liveDiscards(this.kssp_discards1, this.kssp_discards2)

            const discardTopCard1 = this.game.discardTopCard1
            const discardTopCard2 = this.game.discardTopCard2

            let discardTopCards = {
                1: discardTopCard1,
                2: discardTopCard2
            };

            for (let i = 1; i < 3; i++) {
                let currentCard = discardTopCards[i];
                let getcard = this.getCardInfo(currentCard.category, currentCard.family, currentCard.color);
                let cardName = getcard[0];
                let colorId = getcard[1];

                // Создаем HTML строку с нужным цветом
                let enemy_handHTML = "<li id='d" + i + "id_" + discardTopCards[i].id + "' style='color: " + colorId + ";'>" + cardName + "</li>";
                this.dojo.place(enemy_handHTML, "discard_" + i, "last");
            }
        }

        //["cardInDiscardFromDeck", 500], ["cardInHandFromDiscard", 500], ["cardInHandFromDiscardCrab", 500], ["cardInHandFromPick", 500], ["cardInHandFromDeck", 500], ["cardInDiscardFromPick", 500], ["cardsInDeckFromPick", 500], ["playCards", void 0], ["stealCard", void 0], ["revealHand", 1e3], ["announceEndRound", 1e3], ["betResult", 1e3], ["endRound", void 0], ["score", 1500], ["newRound", 1], ["updateCardsPoints", 1], ["emptyDeck", 1], ["reshuffleDeck", void 0]


        // Connect event handlers to follow game progress
        this.dojo.subscribe('cardInDiscardFromDeck', this, "recordDiscardFromDeck"); // Формирование сброса
        this.dojo.subscribe('cardInHandFromDiscard', this, "recordDiscardFromHand"); // Взять карту из стобки сброса
        this.dojo.subscribe('cardInDiscardFromPick', this, "recordDiscardFromPick"); // Положить карту в стобку сброса
        this.dojo.subscribe('cardInHandFromDiscardCrab', this, "recordDiscardCrabInHand"); //...краб
        this.dojo.subscribe('cardInHandFromPick', this, "recordcardInHandFromPick"); // пик карту из колоды

        this.dojo.subscribe('playCards', this, "recordPlayCards"); // Розыгрыш карт
        this.dojo.subscribe('endRound', this, "recordEndRound"); // Конец раунда (очистка)
        this.dojo.subscribe('stealCard', this, "recordStealCard"); // Пловец + акула

        // Создаём новую запись если её нет
        const readResult = dbClient.readByTableId(this.thisTableID);
        if (readResult != null) {
            console.log('Read Result:', readResult);
        } else {
            dbClient.create(this.thisTableID, this.enemy_hand, this.kssp_discards1, this.kssp_discards2);
        }


        // let sql = "SELECT * FROM kssp_data"
        // this.goDB(sql);

        return this;
    },

    // Кнопки
    renderMenu: function () {
        let refrashHTML = "<div id='kssp_menu' class='mb-2'>";
        refrashHTML += "<div class='menu_header'>";
        refrashHTML += "</div>";
        refrashHTML += "<div id='refresh_data' class='menu_item mb-1'>"; //<span class='title'>Обновить:</span>
        refrashHTML += "<button type='button'>Refrash</button></div>";
        refrashHTML += "<div id='save_data' class='menu_item mb-1'>";
        refrashHTML += "<button type='button'>SaveToDB</button></div>";
        refrashHTML += "<div id='load_data' class='menu_item mb-1'>";
        refrashHTML += "<button type='button'>Load Data</button></div>";
        refrashHTML += "</div>";
        this.dojo.place(refrashHTML, "right-side-first-part", "before");

        // Connect event handlers
        this.dojo.connect(this.dojo.query("button", "refresh_data")[0], "onclick", this, "toggleRefrash");
        this.dojo.connect(this.dojo.query("button", "save_data")[0], "onclick", this, "toggleSaveToDB");
        this.dojo.connect(this.dojo.query("button", "load_data")[0], "onclick", this, "toggleLoadInDB");
    },

    renderLogOn: function () {
        var menuHtml = "<div id='kssp_menu' class='mb-0'>";
        menuHtml += "<div class='menu_header'>";
        menuHtml += "</div>";
        menuHtml += "<div id='log_fackoff' class='menu_item'>";
        menuHtml += "<button type='button'>Log On</button></div>";
        menuHtml += "</div>";
        this.dojo.place(menuHtml, "logs_wrap", "before");

        // Connect event handlers
        this.dojo.connect(this.dojo.query("button", "log_fackoff")[0], "onclick", this, "togglelogOn");
    },

    togglelogOn: function () {
        window.parent.document.querySelectorAll('.log_replayable').forEach(function (element) {
            if (element.style.display === 'none') {
                element.style.display = 'block';
            }
        });
    },

    togglelogOn: function () {
        window.parent.document.querySelectorAll('.log_replayable').forEach(function (element) {
            if (element.style.display === 'none') {
                element.style.display = 'block';
            }
        });
    },

    // RefrashDBdata
    toggleRefrash: function (event) {

        console.log("...Обновление сброса...");
        const readResult = dbClient.readByTableId(this.thisTableID);
        //Чистка
        this.dojo.destroy("rdiscards")

        if (readResult != null) {
            const setDiscard = '<div id="rdiscards" class="px-2 pb-2" style="border-radius: 5px; display: flex; justify-content: space-between; background:#f2f2f2;"><div id="discards1" class="discard-list mr-4" style="display: inline-block;"><h3>Discards 1</h3></div><div id="discards2" style="display: inline-block;" class="discard-list"><h3>Discards 2</h3></div></div>';
            this.dojo.place(setDiscard, "table-center", "last");
            let colorHEX = this.colodHEX;
            let NameArr = this.category_family;
            function displayDiscards(discards, elementId) {
                const container = document.getElementById(elementId);
                discards.forEach(discard => {
                    //Определитель
                    // let getcard = this.getCardInfo(discard.category, discard.family, discard.color);
                    let CardColor = colorHEX[discard.color];
                    let CardName = NameArr[discard.category]?.[discard.family];
                    //
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'discard-item';
                    itemDiv.innerHTML = `• <strong style="color:${CardColor}">${CardName}</strong>`;
                    window.parent.dojo.place(itemDiv, elementId, "last");
                });
            }

            displayDiscards(readResult.discards1, 'discards1');
            displayDiscards(readResult.discards2, 'discards2');

        }
    },

    //Сохранить в БД
    toggleSaveToDB: function (event) {
        dbClient.create(this.thisTableID, this.enemy_hand, this.kssp_discards1, this.kssp_discards2);
    },

    toggleLoadInDB: function (event) {
        const readResult = dbClient.readByTableId(this.thisTableID);
        if (readResult != null) {
            const discards1 = readResult.discards1;
            const discards2 = readResult.discards2;
            const players_hand = readResult.players_hand;

            // Discards
            if (discards1) {
                for (let i = 0; i < discards1.length; i++) {
                    //фор по картам
                    let getcard = this.getCardInfo(discards1[i].category, discards1[i].family, discards1[i].color);
                    let cardName = getcard[0];
                    let colorId = getcard[1];

                    // Создаем HTML строку с нужным цветом
                    const discardHTML = "<li id='d1id_" + discards1[i].id + "' style='color: " + colorId + ";'>" + cardName + "</li>";
                    this.dojo.place(discardHTML, "discard_1", "last");
                }
            }
            if (discards2) {
                for (let i = 0; i < discards2.length; i++) {
                    //фор по картам
                    let getcard = this.getCardInfo(discards2[i].category, discards2[i].family, discards2[i].color);
                    let cardName = getcard[0];
                    let colorId = getcard[1];

                    // Создаем HTML строку с нужным цветом
                    const discardHTML = "<li id='d2id_" + discards2[i].id + "' style='color: " + colorId + ";'>" + cardName + "</li>";
                    this.dojo.place(discardHTML, "discard_2", "last");
                }
            }
            if (players_hand) {
                for (let i = 0; i < discards2.length; i++) {
                    //фор по картам
                    let getcard = this.getCardInfo(discards2[i].category, discards2[i].family, discards2[i].color);
                    let cardName = getcard[0];
                    let colorId = getcard[1];

                    // Создаем HTML строку с нужным цветом
                    const discardHTML = "<li id='d2id_" + discards2[i].id + "' style='color: " + colorId + ";'>" + cardName + "</li>";
                    this.dojo.place(discardHTML, "discard_2", "last");
                }
            }

        }
    },

    // События
    // Взять карту из 2 карт.
    recordcardInHandFromPick: function (data) {
        // Input check
        if (!data || !data.args) {
            return;
        }
        if (data.args.card.color) {
            let cardID = data.args.card;
            // Arr
            this.enemy_hand[data.args.playerId].push(data.args.card);

            let playerId = data.args.playerId;

            // Предполагаем, что data.args.cardName и data.args.card.color уже определены
            const cardName = data.args.cardName;
            const colorId = data.args.card.color;

            // Получаем цвет по индексу
            const color = this.colodHEX[colorId];

            // Создаем HTML строку с нужным цветом
            const enemy_handHTML = "<li id='hcid_" + data.args.card.id + "' style='color: " + color + ";'>" + cardName + "</li>";
            this.dojo.place(enemy_handHTML, "enemy_" + playerId + "_cards", "last");

            // БД
            dbClient.update(this.thisTableID, { players_hand: this.enemy_hand, discards1: this.kssp_discards1, discards2: this.kssp_discards2 });
            //
            this.liveDiscards(this.kssp_discards1, this.kssp_discards2)

        }

    },

    // Пловец + акула
    recordStealCard: function (data) {
        // Input check
        if (!data || !data.args) {
            return;
        }

        //
        this.dojo.destroy("hcid_" + data.args.card.id)

        if (clog_status) { console.log("В руках до кражи: ", this.enemy_hand) };
        // Arr opponentId


        if (data.args.card.color) {
            // Я краду playerId
            let opponent = this.enemy_hand[data.args.opponentId]
            let opponentCard = opponent.find(card => card.id == data.args.card.id)
            this.enemy_hand[data.args.playerId].push(data.args.card);
            opponent.splice(opponent.findIndex(card => card.id == data.args.card.id), 1);
            if (clog_status) { console.log("В руках после кражи: ", this.enemy_hand) };
            //

            let getcard = this.getCardInfo(data.args.card.category, data.args.card.family, data.args.card.color);
            let cardName = getcard[0];
            let color = getcard[1];

            const enemy_handHTML = "<li id='hcid_" + data.args.card.id + "' style='color: " + color + ";'><strong>" + cardName + "</strong></li>";
            this.dojo.place(enemy_handHTML, "enemy_" + data.args.playerId + "_cards", "last");
        } else {
            // Он крадёт opponentId
            let my_hand = this.enemy_hand[data.args.opponentId]
            let cid = my_hand.find(card => card.id === data.args.card.id)

            let getcard = this.getCardInfo(cid.category, cid.family, cid.color);
            let cardName = getcard[0];
            let color = getcard[1];

            const enemy_handHTML = "<li id='hcid_" + cid.id + "' style='color: " + color + ";'><strong>" + cardName + "</strong></li>";
            this.dojo.place(enemy_handHTML, "enemy_" + data.args.playerId + "_cards", "last");

            this.enemy_hand[data.args.playerId].push(cid);
            this.enemy_hand[data.args.opponentId].splice(this.enemy_hand[data.args.opponentId].findIndex(card => card.id == data.args.card.id), 1);

        }

        // БД
        dbClient.update(this.thisTableID, { players_hand: this.enemy_hand, discards1: this.kssp_discards1, discards2: this.kssp_discards2 });
        //

    },

    // Конец раунда (очистка)
    recordEndRound: function (data) {
        // Input check
        const activePlayers = window.parent.gameui.cardsManager.game.playersTables;
        if (!data || !data.args) {
            return;
        }

        this.kssp_discards1.length = 0;
        this.kssp_discards2.length = 0;
        Object.keys(this.enemy_hand).forEach(key => {
            this.enemy_hand[key] = [];
        });

        this.dojo.destroy("recDiscards"); // Удаляем первую
        this.dojo.place('<div id="recDiscards" style="margin-right: 10px; height: 100%;background: white;"><b>Сброс 1</b>:<ul id="discard_1"></ul></br><b>Сброс 2</b>:<ul id="discard_2"></ul></div>', "centered-table", "first");

        // Удаляем Руки enemy_95321058_cards
        for (var i = 0; i < activePlayers.length; i++) {
            let playerID = activePlayers[i].playerId
            this.dojo.destroy("enemy_" + playerID + "_hand")
            this.dojo.place('<div id="enemy_' + playerID + '_hand">Карты на руке:<ul id="enemy_' + playerID + '_cards"></ul></div>', "player_board_" + playerID, "last");
        }
        console.log("Конец раунда");
        if (clog_status) { console.log("Сброс 1 очищен", this.kssp_discards1); console.log("Сброс 2 очищен", this.kssp_discards2) }
        if (clog_status) { console.log("В руках очищено : ", this.enemy_hand) };

        // БД
        dbClient.update(this.thisTableID, { players_hand: this.enemy_hand, discards1: this.kssp_discards1, discards2: this.kssp_discards2 });
        //
        this.liveDiscards(this.kssp_discards1, this.kssp_discards2)
    },

    // Розыгрыш карт
    recordPlayCards: function (data) {
        // Input check
        if (!data || !data.args) {
            return;
        }
        let cardID_1 = data.args.cards[0];
        let cardID_2 = data.args.cards[1];
        let enemy_hand = this.enemy_hand[data.args.playerId]

        this.dojo.destroy("hcid_" + cardID_1.id); // Удаляем первую
        this.dojo.destroy("hcid_" + cardID_2.id); // Удаляем вторую


        // Arr !Проверку бы есть ли такие на руке
        enemy_hand.splice(enemy_hand.findIndex(card => card.id == cardID_1), 1);
        enemy_hand.splice(enemy_hand.findIndex(card => card.id == cardID_2), 1);
        if (clog_status) { console.log("В руках после розыгрыша: ", this.enemy_hand) };
        //
        // БД
        dbClient.update(this.thisTableID, { players_hand: this.enemy_hand, discards1: this.kssp_discards1, discards2: this.kssp_discards2 });
        //
    },

    // Краб !!! проверку известа ли карта
    recordDiscardCrabInHand: function (data) {
        // Input check
        if (!data || !data.args) {
            return;
        }
        // приходит data.args.card.id и data.args.card.location
        let cardID = data.args.card;
        let card
        if (cardID.location == "discard1") {
            card = this.kssp_discards1.find(card => card.id === cardID.id);
            // Arr
            this.enemy_hand[data.args.playerId].push(card);
            this.kssp_discards1.splice(this.kssp_discards1.indexOf(card), 1);
            if (clog_status) { console.log("Сброс 1", this.kssp_discards1); console.log("Сброс 2", this.kssp_discards2) }
            if (clog_status) { console.log("В руках: ", this.enemy_hand) };
            //
            let getcard = this.getCardInfo(card.category, card.family, card.color);
            let cardName = getcard[0];
            let colorId = getcard[1];

            const enemy_handHTML = "<li id='hcid_" + cardID.id + "' style='color: " + colorId + ";'><strong>" + cardName + "</strong></li>";
            this.dojo.place(enemy_handHTML, "enemy_" + data.args.playerId + "_cards", "last");

            this.dojo.destroy("d" + data.args.discardId + "id_" + cardID.id);
        } else {
            card = this.kssp_discards2.find(card => card.id === cardID.id);
            // Arr
            this.enemy_hand[data.args.playerId].push(card);
            this.kssp_discards2.splice(this.kssp_discards2.indexOf(card), 1);
            if (clog_status) { console.log("Сброс 1", this.kssp_discards1); console.log("Сброс 2", this.kssp_discards2) }
            if (clog_status) { console.log("В руках: ", this.enemy_hand) };
            //
            let getcard = this.getCardInfo(card.category, card.family, card.color);
            let cardName = getcard[0];
            let colorId = getcard[1];

            const enemy_handHTML = "<li id='hcid_" + cardID.id + "' style='color: " + colorId + ";'><strong>" + cardName + "</strong></li>";
            this.dojo.place(enemy_handHTML, "enemy_" + data.args.playerId + "_cards", "last");

            this.dojo.destroy("d" + data.args.discardId + "id_" + cardID.id);
        }

        // БД
        dbClient.update(this.thisTableID, { players_hand: this.enemy_hand, discards1: this.kssp_discards1, discards2: this.kssp_discards2 });
        //
        this.liveDiscards(this.kssp_discards1, this.kssp_discards2)

    },

    // Положить карту в стобку сброса
    recordDiscardFromPick: function (data) {
        // Input check
        if (!data || !data.args || !data.args.card) {
            return;
        }

        const cardId = data.args.card.id;

        if (data.args.discardId == 1) {
            this.kssp_discards1.push(data.args.card);
            //
            if (data.args.cardName) {
                const cardName = data.args.cardName;
                const colorId = data.args.card.color;

                // Получаем цвет по индексу
                const color = this.colodHEX[colorId];

                // Создаем HTML строку с нужным цветом
                const enemy_handHTML = "<li id='d1id_" + data.args.card.id + "' style='color: " + color + ";'>" + cardName + "</li>";
                this.dojo.place(enemy_handHTML, "discard_1", "last");
            }
            //
        } else {
            this.kssp_discards2.push(data.args.card);
            if (data.args.cardName) {
                const cardName = data.args.cardName;
                const colorId = data.args.card.color;

                // Получаем цвет по индексу
                const color = this.colodHEX[colorId];

                // Создаем HTML строку с нужным цветом
                const enemy_handHTML = "<li id='d2id_" + cardId + "' style='color: " + color + ";'>" + cardName + "</li>";
                this.dojo.place(enemy_handHTML, "discard_2", "last");
            }
        }
        // БД
        dbClient.update(this.thisTableID, { players_hand: this.enemy_hand, discards1: this.kssp_discards1, discards2: this.kssp_discards2 });
        //
        this.liveDiscards(this.kssp_discards1, this.kssp_discards2)
    },

    // Взять карту из стобки сброса
    recordDiscardFromHand: function (data) {
        // Input check
        if (!data || !data.args || !data.args.card) {
            return;
        }
        let cardID = data.args.card;
        // Arr
        this.enemy_hand[data.args.playerId].push(data.args.card);
        if (data.args.discardId == 1) {
            this.kssp_discards1.splice(-1, 1);
        } else {
            this.kssp_discards2.splice(-1, 1);
        }
        if (clog_status) { console.log("Сброс 1", this.kssp_discards1); console.log("Сброс 2", this.kssp_discards2) }
        if (clog_status) { console.log("В руках: ", this.enemy_hand) };
        // БД
        dbClient.update(this.thisTableID, { players_hand: this.enemy_hand, discards1: this.kssp_discards1, discards2: this.kssp_discards2 });
        //
        this.liveDiscards(this.kssp_discards1, this.kssp_discards2)

        let playerId = data.args.playerId;

        // Предполагаем, что data.args.cardName и data.args.card.color уже определены
        const cardName = data.args.cardName;
        const colorId = data.args.card.color;

        // Получаем цвет по индексу
        const color = this.colodHEX[colorId];

        // Создаем HTML строку с нужным цветом
        const enemy_handHTML = "<li id='hcid_" + data.args.card.id + "' style='color: " + color + ";'>" + cardName + "</li>";
        this.dojo.place(enemy_handHTML, "enemy_" + playerId + "_cards", "last");

        // Удаляем с сброса
        this.dojo.destroy("d" + data.args.discardId + "id_" + data.args.card.id);

        // var enemy_handHTML = "<div id='enemy_card'>";

    },

    // Раздача в сброс (начала раунда)
    recordDiscardFromDeck: function (data) {
        // Input check
        if (!data || !data.args || !data.args.card) {
            return;
        }

        const getcard = this.getCardInfo(data.args.card.category, data.args.card.family, data.args.card.color);
        const cardName = getcard[0];
        const colorId = getcard[1];

        if (data.args.card.location == "discard1") {
            this.kssp_discards1.push(data.args.card);
            const enemy_handHTML = "<li id='d1id_" + data.args.card.id + "' style='color: " + colorId + ";'><strong>" + cardName + "</strong></li>";
            this.dojo.place(enemy_handHTML, "discard_1", "last");
        } else {
            this.kssp_discards2.push(data.args.card);
            const enemy_handHTML = "<li id='d2id_" + data.args.card.id + "' style='color: " + colorId + ";'><strong>" + cardName + "</strong></li>";
            this.dojo.place(enemy_handHTML, "discard_2", "last");
        }
        if (clog_status) { console.log("Сброс 1", this.kssp_discards1); console.log("Сброс 2", this.kssp_discards2) }
        // БД
        dbClient.update(this.thisTableID, { players_hand: this.enemy_hand, discards1: this.kssp_discards1, discards2: this.kssp_discards2 });
        //
        this.liveDiscards(this.kssp_discards1, this.kssp_discards2)
        //
    },

    getCardInfo: function (category, family, color) {
        let colorName = this.colodHEX[color];
        let categoryName = this.category_family[category]?.[family];

        if (colorName && categoryName) {
            return [categoryName, colorName];
        } else {
            return 'Неизвестная комбинация color, category или family';
        }
    },

    liveDiscards: function (discards1, discards2) {
        console.log("...Обновление сброса...");

        this.dojo.destroy("rdiscards")

        const setDiscard = '<div id="rdiscards" class="px-2 pb-2" style="border-radius: 5px; display: flex; justify-content: space-between; background:#f2f2f2;"><div id="discards1" class="discard-list mr-4" style="display: inline-block;"><h3>Discards 1</h3></div><div id="discards2" style="display: inline-block;" class="discard-list"><h3>Discards 2</h3></div></div>';
        this.dojo.place(setDiscard, "table-center", "last");
        let colorHEX = this.colodHEX;
        let NameArr = this.category_family;
        function displayDiscards(discards, elementId) {
            const container = document.getElementById(elementId);
            discards.forEach(discard => {
                //Определитель
                let CardColor = colorHEX[discard.color];
                let CardName = NameArr[discard.category]?.[discard.family];
                //
                const itemDiv = document.createElement('div');
                itemDiv.className = 'discard-item';
                itemDiv.innerHTML = `• <strong style="color:${CardColor}">${CardName}</strong>`;
                window.parent.dojo.place(itemDiv, elementId, "last");
            });
        }

        displayDiscards(discards1, 'discards1');
        displayDiscards(discards2, 'discards2');


    },

};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Everything starts here
var onload = async function () {
    if (Is_Inside_Game) {
        await sleep(1000); // Wait for BGA to load dojo and SSP
        if (!window.parent || !window.parent.gameui || !window.parent.gameui.game_name ||
            window.parent.gameui.game_name != "seasaltpaper") {
            return;
        }

        // Prevent multiple launches
        if (window.parent.isksspStarted) {
            return;
        } else {
            window.parent.isksspStarted = true;
            window.parent.kssp = kssp.init();
        }
    }
};

if (document.readyState === "complete") {
    onload();
} else {
    (addEventListener).call(window, addEventListener ? "load" : "onload", onload);
}

(function () {
    'use strict';

    // Your code here...
})();
