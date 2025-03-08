// 全局变量
let examConfig = null;
let currentSubject = null;
let alertTimers = [];
let audioPlayer = new Audio();

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载默认配置文件
    loadConfigFile('exam_config.json');
    
    // 设置导入配置文件按钮事件
    document.getElementById('importConfig').addEventListener('click', function() {
        document.getElementById('configFileInput').click();
    });
    
    // 监听文件选择
    document.getElementById('configFileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const config = JSON.parse(e.target.result);
                    examConfig = config;
                    updateUI();
                    alert('配置文件导入成功！');
                } catch (error) {
                    alert('配置文件格式错误，请检查JSON格式！');
                    console.error('配置文件解析错误:', error);
                }
            };
            reader.readAsText(file);
        }
    });
    
    // 更新时钟
    updateClock();
    setInterval(updateClock, 1000);
    
    // 科目选择变化事件
    document.getElementById('examSubject').addEventListener('change', function() {
        const selectedIndex = this.selectedIndex;
        if (selectedIndex >= 0 && examConfig && examConfig.subjects) {
            currentSubject = examConfig.subjects[selectedIndex];
            updateExamInfo();
            updateAlertList();
            checkExamStatus();
            clearAllTimers();
            setupAlertTimers();
        }
    });
});

// 加载配置文件
function loadConfigFile(filename) {
    fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error('配置文件加载失败');
            }
            return response.json();
        })
        .then(data => {
            examConfig = data;
            updateUI();
        })
        .catch(error => {
            console.error('加载配置文件错误:', error);
            alert('无法加载配置文件，请检查文件是否存在或格式是否正确。');
        });
}

// 更新整个UI
function updateUI() {
    if (!examConfig) return;
    
    // 更新考试标题
    if (examConfig.title) {
        document.getElementById('examTitle').textContent = examConfig.title;
        document.title = examConfig.title;
    }
    
    // 更新科目下拉列表
    const subjectSelect = document.getElementById('examSubject');
    subjectSelect.innerHTML = '';
    
    if (examConfig.subjects && examConfig.subjects.length > 0) {
        examConfig.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.name;
            option.textContent = subject.name;
            subjectSelect.appendChild(option);
        });
        
        // 默认选择第一个科目
        currentSubject = examConfig.subjects[0];
        updateExamInfo();
        updateAlertList();
        checkExamStatus();
        clearAllTimers();
        setupAlertTimers();
    }
}

// 更新考试信息
function updateExamInfo() {
    if (!currentSubject) return;
    
    document.getElementById('examDate').textContent = currentSubject.date || '--';
    document.getElementById('startTime').textContent = currentSubject.startTime || '--:--';
    document.getElementById('endTime').textContent = currentSubject.endTime || '--:--';
}
// 更新铃声列表
// 添加一个全局变量来存储自定义的提醒时间
let customAlertTimes = {
    'before20min': 20,
    'before15min': 15,
    'before5min': 5,
    'end15min': 15
};

// 在updateAlertList函数中使用自定义时间值
function updateAlertList() {
    if (!currentSubject) return;
    
    const alertList = document.getElementById('alertList');
    alertList.innerHTML = '';
    
    // 定义所有提醒类型，使用customAlertTimes中的值
    const alertTypes = [
        { id: 'before20min', name: '考前', value: customAlertTimes.before20min, suffix: '分钟', offset: -customAlertTimes.before20min },
        { id: 'before15min', name: '考前', value: customAlertTimes.before15min, suffix: '分钟', offset: -customAlertTimes.before15min },
        { id: 'before5min', name: '考前', value: customAlertTimes.before5min, suffix: '分钟', offset: -customAlertTimes.before5min },
        { id: 'examStart', name: '考试开始', offset: 0 },
        { id: 'end15min', name: '结束前', value: customAlertTimes.end15min, suffix: '分钟', offset: -customAlertTimes.end15min, isEnd: true },
        { id: 'examEnd', name: '考试结束', offset: 0, isEnd: true }
    ];
    
    alertTypes.forEach(type => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        
        // 计算具体时间
        let alertTime = '';
        if (currentSubject.startTime && !type.isEnd) {
            alertTime = calculateTime(currentSubject.startTime, type.offset);
        } else if (currentSubject.endTime && type.isEnd) {
            alertTime = calculateTime(currentSubject.endTime, type.offset);
        }
        
        // 获取当前设置的铃声
        const currentSound = currentSubject[type.id] || '未设置';
        
        // 创建提醒名称，对于可修改的时间添加输入框
        let nameHtml = '';
        if (type.value !== undefined) {
            nameHtml = `${type.name}<input type="number" class="time-input" data-type="${type.id}" value="${type.value}">${type.suffix}`;
        } else {
            nameHtml = type.name;
        }
        
        alertItem.innerHTML = `
            <div class="alert-name">${nameHtml}</div>
            <div class="alert-time" id="${type.id}-time">${alertTime}</div>
            <div class="alert-sound" id="${type.id}-sound">${currentSound}</div>
            <div class="alert-buttons">
                <button class="btn btn-select" data-type="${type.id}">选择铃声</button>
                <button class="btn btn-play" data-type="${type.id}" ${currentSound === '未设置' ? 'disabled' : ''}>试听</button>
            </div>
        `;
        
        alertList.appendChild(alertItem);
    });
    
    // 添加选择铃声按钮事件
    document.querySelectorAll('.btn-select').forEach(button => {
        button.addEventListener('click', function() {
            const alertType = this.getAttribute('data-type');
            selectSound(alertType);
        });
    });
    
    // 添加试听按钮事件
    document.querySelectorAll('.btn-play').forEach(button => {
        button.addEventListener('click', function() {
            const alertType = this.getAttribute('data-type');
            playSound(currentSubject[alertType]);
        });
    });
    
    // 添加时间输入框变化事件
    document.querySelectorAll('.time-input').forEach(input => {
        input.addEventListener('change', function() {
            const alertType = this.getAttribute('data-type');
            const value = parseInt(this.value);
            
            if (isNaN(value) || value < 0) {
                alert('请输入有效的正整数');
                return;
            }
            
            // 更新自定义时间值
            customAlertTimes[alertType] = value;
            
            // 更新对应的alertType的offset值
            const alertTypeObj = alertTypes.find(type => type.id === alertType);
            if (alertTypeObj) {
                alertTypeObj.offset = alertTypeObj.isEnd ? -value : -value;
                alertTypeObj.value = value;
                
                // 重新计算并显示时间
                let newTime = '';
                if (currentSubject.startTime && !alertTypeObj.isEnd) {
                    newTime = calculateTime(currentSubject.startTime, alertTypeObj.offset);
                } else if (currentSubject.endTime && alertTypeObj.isEnd) {
                    newTime = calculateTime(currentSubject.endTime, alertTypeObj.offset);
                }
                
                document.getElementById(`${alertType}-time`).textContent = newTime;
                
                // 重新设置定时器
                clearAllTimers();
                setupAlertTimers();
            }
        });
    });
}

// 设置提醒定时器
function setupAlertTimers() {
    if (!currentSubject) return;
    
    const now = new Date();
    
    // 定义所有提醒类型，使用customAlertTimes中的值
    const alertTypes = [
        { id: 'before20min', offset: -customAlertTimes.before20min, isEnd: false },
        { id: 'before15min', offset: -customAlertTimes.before15min, isEnd: false },
        { id: 'before5min', offset: -customAlertTimes.before5min, isEnd: false },
        { id: 'examStart', offset: 0, isEnd: false },
        { id: 'end15min', offset: -customAlertTimes.end15min, isEnd: true },
        { id: 'examEnd', offset: 0, isEnd: true }
    ];
    
    alertTypes.forEach(type => {
        if (!currentSubject[type.id]) return; // 如果没有设置铃声，跳过
        
        let targetTime;
        
        if (!type.isEnd && currentSubject.startTime) {
            // 考试开始相关的提醒
            const [hours, minutes] = currentSubject.startTime.split(':').map(Number);
            targetTime = new Date();
            targetTime.setHours(hours, minutes, 0, 0);
            targetTime.setMinutes(targetTime.getMinutes() + type.offset);
        } else if (type.isEnd && currentSubject.endTime) {
            // 考试结束相关的提醒
            const [hours, minutes] = currentSubject.endTime.split(':').map(Number);
            targetTime = new Date();
            targetTime.setHours(hours, minutes, 0, 0);
            targetTime.setMinutes(targetTime.getMinutes() + type.offset);
        } else {
            return; // 如果没有相关时间，跳过
        }
        
        // 如果目标时间已经过去，跳过
        if (targetTime <= now) return;
        
        // 计算延迟时间（毫秒）
        const delay = targetTime.getTime() - now.getTime();
        
        // 设置定时器
        const timer = setTimeout(() => {
            playSound(currentSubject[type.id]);
        }, delay);
        
        alertTimers.push(timer);
    });
}
// 计算时间
function calculateTime(baseTime, offsetMinutes) {
    if (!baseTime) return '--:--';
    
    const [hours, minutes] = baseTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + offsetMinutes);
    
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 更新时钟
function updateClock() {
    const now = new Date();
    
    // 更新时间
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}:${seconds}`;
    
    // 更新日期和星期
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[now.getDay()];
    
    document.getElementById('currentDate').textContent = `${year}年${month}月${day}日 星期${weekday}`;
    
    // 检查考试状态
    if (currentSubject) {
        checkExamStatus();
    }
}

// 检查考试状态
function checkExamStatus() {
    if (!currentSubject || !currentSubject.startTime || !currentSubject.endTime) return;
    
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const statusElement = document.getElementById('examStatus');
    
    // 解析开始和结束时间
    const [startHours, startMinutes] = currentSubject.startTime.split(':').map(Number);
    const [endHours, endMinutes] = currentSubject.endTime.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    // 判断考试状态
    if (now < startDate) {
        statusElement.textContent = '未开始';
        statusElement.className = 'status not-started';
    } else if (now >= startDate && now < endDate) {
        statusElement.textContent = '进行中';
        statusElement.className = 'status in-progress';
    } else {
        statusElement.textContent = '已结束';
        statusElement.className = 'status ended';
    }
}

// 清除所有定时器
function clearAllTimers() {
    alertTimers.forEach(timer => clearTimeout(timer));
    alertTimers = [];
}

// 使用这个新的setupAlertTimers函数，它使用customAlertTimes中的值
function setupAlertTimers() {
    if (!currentSubject) return;
    
    const now = new Date();
    
    // 定义所有提醒类型，使用customAlertTimes中的值
    const alertTypes = [
        { id: 'before20min', offset: -customAlertTimes.before20min, isEnd: false },
        { id: 'before15min', offset: -customAlertTimes.before15min, isEnd: false },
        { id: 'before5min', offset: -customAlertTimes.before5min, isEnd: false },
        { id: 'examStart', offset: 0, isEnd: false },
        { id: 'end15min', offset: -customAlertTimes.end15min, isEnd: true },
        { id: 'examEnd', offset: 0, isEnd: true }
    ];
    
    alertTypes.forEach(type => {
        if (!currentSubject[type.id]) return; // 如果没有设置铃声，跳过
        
        let targetTime;
        
        if (!type.isEnd && currentSubject.startTime) {
            // 考试开始相关的提醒
            const [hours, minutes] = currentSubject.startTime.split(':').map(Number);
            targetTime = new Date();
            targetTime.setHours(hours, minutes, 0, 0);
            targetTime.setMinutes(targetTime.getMinutes() + type.offset);
        } else if (type.isEnd && currentSubject.endTime) {
            // 考试结束相关的提醒
            const [hours, minutes] = currentSubject.endTime.split(':').map(Number);
            targetTime = new Date();
            targetTime.setHours(hours, minutes, 0, 0);
            targetTime.setMinutes(targetTime.getMinutes() + type.offset);
        } else {
            return; // 如果没有相关时间，跳过
        }
        
        // 如果目标时间已经过去，跳过
        if (targetTime <= now) return;
        
        // 计算延迟时间（毫秒）
        const delay = targetTime.getTime() - now.getTime();
        
        // 设置定时器
        const timer = setTimeout(() => {
            playSound(currentSubject[type.id]);
        }, delay);
        
        alertTimers.push(timer);
    });
}

// 选择铃声
function selectSound(alertType) {
    if (!currentSubject) return;
    
    // 创建一个隐藏的文件输入元素
    const fileInput = document.getElementById('soundFileInput');
    
    // 设置文件选择完成后的处理函数
    fileInput.onchange = function(event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            
            // 检查是否为音频文件
            if (!file.type.startsWith('audio/')) {
                alert('请选择音频文件！');
                return;
            }
            
            // 将文件复制到sounds文件夹（这一步在实际应用中需要服务器支持）
            // 这里简化处理，直接使用文件名
            const soundName = file.name;
            
            // 更新当前科目的铃声设置
            currentSubject[alertType] = soundName;
            document.getElementById(`${alertType}-sound`).textContent = soundName;
            
            // 启用试听按钮
            const playButton = document.querySelector(`.btn-play[data-type="${alertType}"]`);
            if (playButton) {
                playButton.disabled = false;
            }
            
            // 重新设置定时器
            clearAllTimers();
            setupAlertTimers();
        }
    };
    
    // 触发文件选择对话框
    fileInput.click();
}
// 播放声音 - 修改为支持直接播放文件对象
function playSound(soundName) {
    if (!soundName) return;
    
    // 停止当前播放
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    
    // 清除之前的事件监听器
    audioPlayer.oncanplaythrough = null;
    audioPlayer.onerror = null;
    
    // 设置新的音频源
    // 检查是否为File对象
    if (soundName instanceof File) {
        audioPlayer.src = URL.createObjectURL(soundName);
    } else {
        // 否则按照原来的方式处理
        audioPlayer.src = `sounds/${soundName}`;
        
        // 添加音频加载错误处理
        audioPlayer.onerror = function() {
            console.error(`音频文件 ${soundName} 加载失败`);
            alert(`无法加载音频文件: ${soundName}，请确认文件存在于sounds文件夹中`);
        };
    }
    
    // 设置预加载
    audioPlayer.preload = 'auto';
    
    // 播放前确保音频完全加载
    audioPlayer.oncanplaythrough = function() {
        // 设置短暂延迟确保音频引擎准备完毕
        setTimeout(() => {
            // 播放
            audioPlayer.play().catch(error => {
                console.error('播放音频失败:', error);
                alert(`无法播放音频: ${soundName}，错误信息: ${error.message}`);
            });
        }, 100);
    };
    
    // 加载音频
    audioPlayer.load();
    
    // 设置超时检查
    setTimeout(() => {
        if (audioPlayer.readyState < 3) { // 3表示有足够数据可以播放
            console.error(`音频文件 ${soundName} 加载超时`);
            alert(`音频文件 ${soundName} 加载超时，请检查文件是否存在`);
        }
    }, 5000); // 增加超时时间
}