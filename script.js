const CORRECT_PASSWORD = '5201314'; // 设置密码，你可以修改为你想要的密码

class Snowfall {
    constructor() {
        this.container = document.querySelector('.snowfall-container');
        this.snowflakeChars = ['❅', '❆', '❄']; // 减少雪花种类
        this.maxSnowflakes = window.innerWidth < 768 ? 10 : 20;
        this.createInterval = window.innerWidth < 768 ? 1000 : 500;
        this.init();
    }

    createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = this.snowflakeChars[Math.floor(Math.random() * this.snowflakeChars.length)];
        
        // 随机设置雪花的属性
        const size = Math.random() * 15 + 10; // 10-25px
        const startPositionX = Math.random() * window.innerWidth;
        const duration = Math.random() * 5 + 5; // 5-10秒
        const opacity = Math.random() * 0.6 + 0.4; // 0.4-1

        Object.assign(snowflake.style, {
            left: `${startPositionX}px`,
            fontSize: `${size}px`,
            opacity: opacity,
            animation: `snowfall ${duration}s linear infinite`
        });

        // 当动画结束时移除雪
        snowflake.addEventListener('animationend', () => {
            snowflake.remove();
        });

        this.container.appendChild(snowflake);
    }

    init() {
        // 减少初始雪花数量
        for (let i = 0; i < Math.min(5, this.maxSnowflakes); i++) {
            setTimeout(() => {
                this.createSnowflake();
            }, Math.random() * 1000);
        }

        // 降低创建频率
        setInterval(() => {
            if (this.container.children.length < this.maxSnowflakes) {
                this.createSnowflake();
            }
        }, this.createInterval);
    }
}

class Anniversary {
    constructor(name, date) {
        this.name = name;
        this.date = date;
    }

    getTimeUntil() {
        const now = new Date();
        const eventDate = new Date(this.date);
        
        // 设置事件日期为今年
        eventDate.setFullYear(now.getFullYear());
        
        // 如果今年的日期已经过了，就计算到明年的日期
        if (eventDate < now) {
            eventDate.setFullYear(now.getFullYear() + 1);
        }

        const timeDiff = eventDate - now;
        
        // 计算天、小时、分钟、秒、毫秒
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        const milliseconds = timeDiff % 1000;

        return {
            days,
            hours,
            minutes,
            seconds,
            milliseconds
        };
    }

    getTimePassed() {
        const now = new Date();
        const eventDate = new Date(this.date);
        const timeDiff = now - eventDate;
        
        // 计算已经过去的时间
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        const milliseconds = timeDiff % 1000;

        return {
            days,
            hours,
            minutes,
            seconds,
            milliseconds
        };
    }

    getFormattedDate() {
        const date = new Date(this.date);
        return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
    }
}

class AnniversaryManager {
    constructor() {
        this.loadDataFromJson();
        this.setupEventListeners();
        this.startCountdown();
        this.currentEditIndex = -1; // 添加当前编辑项的索引
        this.currentDeleteIndex = -1; // 添加当前删除项的索引
        this.pressTimer = null;
        this.longPressDelay = 800; // 长按触发时间（毫秒）
        
        // 初始化雪花效果
        new Snowfall();
        
        // 添加彩蛋监听
        this.setupEasterEggs();
        
        // 添加导出导入按钮的事件监听
        this.setupDataManagement();
    }

    async loadDataFromJson() {
        try {
            // 尝试从本地存储加载数据
            const localData = localStorage.getItem('anniversaries');
            if (localData) {
                this.anniversaries = JSON.parse(localData);
                this.loadAnniversaries();
                return;
            }

            // 如果本地没有数据，从 JSON 文件加载
            const response = await fetch('anniversaryData.json');
            const data = await response.json();
            
            if (data.anniversaries) {
                this.anniversaries = data.anniversaries;
                // 保存到本地存储
                localStorage.setItem('anniversaries', JSON.stringify(this.anniversaries));
                this.loadAnniversaries();
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.anniversaries = [];
        }
    }

    loadAnniversaries() {
        const list = document.getElementById('anniversaryList');
        list.innerHTML = '';
        
        this.anniversaries.forEach((anni, index) => {
            const anniversary = new Anniversary(anni.name, anni.date);
            const timeUntil = anniversary.getTimeUntil();
            const timePassed = anniversary.getTimePassed();
            
            const item = document.createElement('div');
            item.className = 'anniversary-item';
            item.dataset.index = index;
            item.innerHTML = `
                <h3>${anniversary.name}</h3>
                <p class="date-text">相识于：${anniversary.getFormattedDate()}</p>
                <div class="time-passed" data-date-passed="${anniversary.date}">
                    <p class="countdown-text">
                        距今已经过去：
                        <span class="time-number passed">${timePassed.days}</span> 天
                        <span class="time-number passed">${timePassed.hours}</span> 小时
                        <span class="time-number passed">${timePassed.minutes}</span> 分钟
                        <span class="time-number passed">${timePassed.seconds}</span> 秒
                        <span class="time-number-ms passed">${timePassed.milliseconds}</span> 毫秒
                    </p>
                </div>
                <div class="countdown" data-date="${anniversary.date}">
                    <p class="countdown-text">
                        距离下次纪念日还有：
                        <span class="time-number">${timeUntil.days}</span> 天
                        <span class="time-number">${timeUntil.hours}</span> 小时
                        <span class="time-number">${timeUntil.minutes}</span> 分钟
                        <span class="time-number">${timeUntil.seconds}</span> 秒
                        <span class="time-number-ms">${timeUntil.milliseconds}</span> 毫秒
                    </p>
                </div>
            `;
            list.appendChild(item);

            this.setupLongPress(item);
        });
    }

    createAnniversaryItem(anni, index) {
        const item = document.createElement('div');
        item.className = 'anniversary-item';
        // ... 设置内容
        return item;
    }

    setupLongPress(element) {
        // 鼠标/触摸开始事件
        const startHandler = (e) => {
            this.pressTimer = setTimeout(() => {
                const actionMenu = element.querySelector('.action-menu');
                actionMenu.style.display = 'flex';
                element.classList.add('being-pressed');
                
                // 添加编辑和删除按钮的事件监听
                const editBtn = actionMenu.querySelector('.edit-btn');
                const deleteBtn = actionMenu.querySelector('.delete-btn');
                
                editBtn.addEventListener('click', () => {
                    this.showEditModal(parseInt(element.dataset.index));
                });
                
                deleteBtn.addEventListener('click', () => {
                    this.showDeleteModal(parseInt(element.dataset.index));
                });
            }, this.longPressDelay);
        };

        // 鼠标/触摸结束事件
        const endHandler = () => {
            clearTimeout(this.pressTimer);
        };

        // 添加触摸事件监听（移动设备）
        element.addEventListener('touchstart', startHandler);
        element.addEventListener('touchend', endHandler);
        
        // 添加鼠标事件监听（桌面设备）
        element.addEventListener('mousedown', startHandler);
        element.addEventListener('mouseup', endHandler);
        element.addEventListener('mouseleave', endHandler);

        // 阻止长按时的默认行为（如选中文本）
        element.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    showEditModal(index) {
        const modal = document.getElementById('editModal');
        const nameInput = document.getElementById('editEventName');
        const dateInput = document.getElementById('editEventDate');
        
        this.currentEditIndex = index;
        nameInput.value = this.anniversaries[index].name;
        dateInput.value = this.anniversaries[index].date;
        modal.style.display = 'block';
    }

    showDeleteModal(index) {
        const modal = document.getElementById('deleteModal');
        this.currentDeleteIndex = index;
        modal.style.display = 'block';
    }

    startCountdown() {
        // 降低更新频率，避免抖动
        setInterval(() => {
            this.updateCountdowns();
        }, 1000); // 改为每秒更新一次
    }

    // 检测是否为移动设备
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    updateCountdowns() {
        this.anniversaries.forEach(anni => {
            const anniversary = new Anniversary(anni.name, anni.date);
            const timeUntil = anniversary.getTimeUntil();
            const timePassed = anniversary.getTimePassed();
            
            const countdown = document.querySelector(`[data-date="${anni.date}"] .countdown-text`);
            const timePassedEl = document.querySelector(`[data-date-passed="${anni.date}"] .countdown-text`);
            
            if (countdown) {
                // 只更新数字内容，不更新整个 HTML
                this.updateTimeNumbers(countdown, timeUntil, false);
            }
            if (timePassedEl) {
                this.updateTimeNumbers(timePassedEl, timePassed, true);
            }
        });
    }

    updateTimeNumbers(element, time, isPassed) {
        // 获取所有时间数字元素
        const numbers = element.querySelectorAll(isPassed ? '.time-number.passed' : '.time-number');
        const ms = element.querySelector(isPassed ? '.time-number-ms.passed' : '.time-number-ms');
        
        // 更新数字内容
        if (numbers.length >= 4) {
            numbers[0].textContent = time.days;
            numbers[1].textContent = time.hours;
            numbers[2].textContent = time.minutes;
            numbers[3].textContent = time.seconds;
        }
        if (ms) {
            ms.textContent = time.milliseconds;
        }
    }

    updateTimeDisplay(element, time, isPassed) {
        const className = isPassed ? 'passed' : '';
        element.innerHTML = `
            <p class="countdown-text">
                ${isPassed ? '距今已经过去：' : '距离下次纪念日还有：'}
                <span class="time-number ${className}">${time.days}</span> 天
                <span class="time-number ${className}">${time.hours}</span> 小时
                <span class="time-number ${className}">${time.minutes}</span> 分钟
                <span class="time-number ${className}">${time.seconds}</span> 秒
                ${this.isMobile() ? '' : `<span class="time-number-ms ${className}">${time.milliseconds}</span> 毫秒`}
            </p>
        `;
    }

    addAnniversary(name, date) {
        this.anniversaries.push({ name, date });
        localStorage.setItem('anniversaries', JSON.stringify(this.anniversaries));
        this.loadAnniversaries();
    }

    setupEventListeners() {
        const addNewBtn = document.getElementById('addNewBtn');
        const modal = document.getElementById('addModal');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        addNewBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        submitBtn.addEventListener('click', () => {
            const password = document.getElementById('password').value;
            const eventName = document.getElementById('eventName').value;
            const eventDate = document.getElementById('eventDate').value;

            if (password !== CORRECT_PASSWORD) {
                alert('密码错误！');
                return;
            }

            if (!eventName || !eventDate) {
                alert('请填写完整信息！');
                return;
            }

            this.addAnniversary(eventName, eventDate);
            modal.style.display = 'none';
            
            // 清空输入框
            document.getElementById('password').value = '';
            document.getElementById('eventName').value = '';
            document.getElementById('eventDate').value = '';
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // 添加编辑相关的事件监听
        const editModal = document.getElementById('editModal');
        const updateBtn = document.getElementById('updateBtn');
        const editCancelBtn = document.getElementById('editCancelBtn');

        updateBtn.addEventListener('click', () => {
            const password = document.getElementById('editPassword').value;
            if (password !== CORRECT_PASSWORD) {
                alert('密码错误！');
                return;
            }

            const name = document.getElementById('editEventName').value;
            const date = document.getElementById('editEventDate').value;

            if (!name || !date) {
                alert('请填写完整信息！');
                return;
            }

            this.anniversaries[this.currentEditIndex] = { name, date };
            localStorage.setItem('anniversaries', JSON.stringify(this.anniversaries));
            this.loadAnniversaries();
            editModal.style.display = 'none';
            document.getElementById('editPassword').value = '';
        });

        editCancelBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
            document.getElementById('editPassword').value = '';
        });

        // 添加删除相关的事件监听
        const deleteModal = document.getElementById('deleteModal');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const deleteCancelBtn = document.getElementById('deleteCancelBtn');

        confirmDeleteBtn.addEventListener('click', () => {
            const password = document.getElementById('deletePassword').value;
            if (password !== CORRECT_PASSWORD) {
                alert('密码错误！');
                return;
            }

            this.anniversaries.splice(this.currentDeleteIndex, 1);
            localStorage.setItem('anniversaries', JSON.stringify(this.anniversaries));
            this.loadAnniversaries();
            deleteModal.style.display = 'none';
            document.getElementById('deletePassword').value = '';
        });

        deleteCancelBtn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            document.getElementById('deletePassword').value = '';
        });
    }

    setupEasterEggs() {
        let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;

        // 监听 Konami Code
        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.triggerLoveExplosion();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });

        // 监听特殊日期
        const now = new Date();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        if (month === 5 && date === 20) {  // 520
            this.trigger520Effect();
        }

        // 双击标题触发彩蛋
        const title = document.querySelector('.title-box');
        let clickCount = 0;
        let clickTimer;

        title.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                this.triggerTitleEffect();
            }
        });

        // 隐藏的密彩蛋
        document.addEventListener('input', (e) => {
            if (e.target.type === 'password' && e.target.value === '1314520') {
                this.triggerSecretEffect();
            }
        });
    }

    triggerLoveExplosion() {
        // 创建心烟花效果
        for (let i = 0; i < 20; i++) {
            const heart = document.createElement('div');
            heart.className = 'easter-heart';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 3000);
        }
    }

    trigger520Effect() {
        document.body.style.animation = 'rainbow 5s infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }

    triggerTitleEffect() {
        const hearts = ['❤️', '💖', '💗', '💓', '💕'];
        const title = document.querySelector('.title-box');
        hearts.forEach((heart, index) => {
            setTimeout(() => {
                const floatingHeart = document.createElement('span');
                floatingHeart.textContent = heart;
                floatingHeart.className = 'floating-heart';
                floatingHeart.style.left = Math.random() * title.offsetWidth + 'px';
                title.appendChild(floatingHeart);
                setTimeout(() => floatingHeart.remove(), 2000);
            }, index * 200);
        });
    }

    triggerSecretEffect() {
        // 创建一个特殊的消息
        const message = document.createElement('div');
        message.className = 'secret-message';
        message.textContent = '永远爱你 ❤️';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }

    setupDataManagement() {
        // 创建隐藏的按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'data-management-buttons';
        buttonContainer.style.display = 'none';

        // 创建按钮和文件输入
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn export-btn';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> 导出数据';
        
        const importBtn = document.createElement('button');
        importBtn.className = 'btn import-btn';
        importBtn.innerHTML = '<i class="fas fa-upload"></i> 导入数据';
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';

        // 加按钮事件
        exportBtn.onclick = () => this.exportData();
        importBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => this.importData(e);

        // 将按钮添加到容器
        buttonContainer.appendChild(exportBtn);
        buttonContainer.appendChild(importBtn);
        buttonContainer.appendChild(fileInput);
        document.body.appendChild(buttonContainer);

        // 设置长按标题触发
        const titleBox = document.querySelector('.title-box');
        let pressTimer;
        const longPressDelay = 800; // 长按时间阈值

        // 触摸事件
        titleBox.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                this.showDataManagementButtons(buttonContainer, e);
            }, longPressDelay);
        });

        titleBox.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        // 鼠标事件
        titleBox.addEventListener('mousedown', (e) => {
            pressTimer = setTimeout(() => {
                this.showDataManagementButtons(buttonContainer, e);
            }, longPressDelay);
        });

        titleBox.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
        });

        titleBox.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
        });

        // 点击其他地方隐藏按钮
        document.addEventListener('click', (e) => {
            if (!buttonContainer.contains(e.target) && !titleBox.contains(e.target)) {
                buttonContainer.style.display = 'none';
            }
        });
    }

    showDataManagementButtons(buttonContainer, event) {
        const rect = event.target.getBoundingClientRect();
        buttonContainer.style.position = 'fixed';
        buttonContainer.style.top = `${rect.bottom + 10}px`;
        buttonContainer.style.left = '50%';
        buttonContainer.style.transform = 'translateX(-50%)'; // 居中显示
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.zIndex = '1000';
        buttonContainer.style.animation = 'fadeIn 0.3s ease';
    }

    exportData() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            anniversaries: this.anniversaries.map(anni => ({
                name: anni.name,
                date: anni.date,
                createdAt: anni.createdAt || new Date().toISOString(),
                lastModified: new Date().toISOString()
            }))
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `love_memories_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.anniversaries) {
                    const password = prompt('请输入密码以导入数据：');
                    if (password === CORRECT_PASSWORD) {
                        this.anniversaries = data.anniversaries;
                        localStorage.setItem('anniversaries', JSON.stringify(this.anniversaries));
                        this.loadAnniversaries();
                        alert('数据导入成功！');
                    } else {
                        alert('密码错误！');
                    }
                } else {
                    alert('无效的数据格式！');
                }
            } catch (error) {
                alert('导入失败：无效的文件格式！');
            }
        };
        reader.readAsText(file);
    }
}

// 初始化应用
new AnniversaryManager(); 