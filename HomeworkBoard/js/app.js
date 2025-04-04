// 全局变量
let currentDate = new Date();
let fontSizeBase = 16; // 基础字体大小
let subjects = []; // 学科列表
let students = []; // 学生列表
let attendanceData = {}; // 出勤数据
let homeworkData = {}; // 作业数据
let classDuty = []; // 班级值日
let areaDuty = []; // 包干区值日

// DOM 元素
const classNameEl = document.getElementById('class-name');
const currentDateEl = document.getElementById('current-date');
const subjectsContainerEl = document.getElementById('subjects-container');
const totalHomeworkEl = document.getElementById('total-homework');
const completedHomeworkEl = document.getElementById('completed-homework');
const incompleteHomeworkEl = document.getElementById('incomplete-homework');
const dueTodayEl = document.getElementById('due-today');
const totalStudentsEl = document.getElementById('total-students');
const presentStudentsEl = document.getElementById('present-students');
const leaveCountEl = document.getElementById('leave-count');
const lateCountEl = document.getElementById('late-count');
const absentCountEl = document.getElementById('absent-count');
const leaveListEl = document.getElementById('leave-list');
const lateListEl = document.getElementById('late-list');
const absentListEl = document.getElementById('absent-list');
const classDutyListEl = document.getElementById('class-duty-list');
const areaDutyListEl = document.getElementById('area-duty-list');
const studentGridEl = document.getElementById('student-grid');
const classDutySelectionEl = document.getElementById('class-duty-selection');
const areaDutySelectionEl = document.getElementById('area-duty-selection');

// 模态框元素
const homeworkModalEl = document.getElementById('homework-modal');
const attendanceModalEl = document.getElementById('attendance-modal');
const subjectModalEl = document.getElementById('subject-modal');
const addStudentModalEl = document.getElementById('add-student-modal');

// 初始化函数
function init() {
    updateDateDisplay();
    loadData();
    setupEventListeners();
    renderSubjects();
    updateHomeworkStats();
    updateAttendanceStats();
    setupSortable();
}

// 更新日期显示
function updateDateDisplay() {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    currentDateEl.textContent = currentDate.toLocaleDateString('zh-CN', options);
    
    // 更新顶栏中的日期显示
    const dateString = formatDate(currentDate);
    const today = formatDate(new Date());
    
    // 更新顶栏中的"今日作业"标题，根据选择的日期显示"今日作业"或"XX日作业"
    const homeworkTitleEl = document.getElementById('homework-title');
    if (homeworkTitleEl) {
        if (dateString === today) {
            homeworkTitleEl.textContent = '今日作业';
        } else {
            const month = currentDate.getMonth() + 1;
            const day = currentDate.getDate();
            homeworkTitleEl.textContent = `${month}月${day}日作业`;
        }
    }
}

// 加载数据
function loadData() {
    // 加载班级名称
    const savedClassName = localStorage.getItem('className');
    if (savedClassName) {
        classNameEl.textContent = savedClassName;
    }

    // 加载字体大小
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        fontSizeBase = parseInt(savedFontSize);
        document.documentElement.style.fontSize = `${fontSizeBase}px`;
        document.documentElement.style.setProperty('--font-size-base', `${fontSizeBase}px`);
    }

    // 加载主题模式
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="bi bi-sun"></i>';
    }

    // 加载当前日期的数据
    const dateString = formatDate(currentDate);
    
    // 加载学科数据
    const savedSubjects = localStorage.getItem('subjects');
    if (savedSubjects) {
        subjects = JSON.parse(savedSubjects);
    } else {
        // 默认学科
        subjects = [
            { id: 'subject-1', name: '语文', color: '#4CAF50' },
            { id: 'subject-2', name: '数学', color: '#2196F3' },
            { id: 'subject-3', name: '英语', color: '#FFC107' },
            { id: 'subject-4', name: '物理', color: '#9C27B0' },
            { id: 'subject-5', name: '化学', color: '#F44336' },
            { id: 'subject-6', name: '生物', color: '#FF9800' }
        ];
        saveSubjects();
    }

    // 加载学生数据
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    }

    // 加载作业数据
    const savedHomeworkData = localStorage.getItem(`homework_${dateString}`);
    if (savedHomeworkData) {
        homeworkData = JSON.parse(savedHomeworkData);
    } else {
        homeworkData = {};
        subjects.forEach(subject => {
            homeworkData[subject.id] = [];
        });
    }

    // 加载出勤数据
    const savedAttendanceData = localStorage.getItem(`attendance_${dateString}`);
    if (savedAttendanceData) {
        attendanceData = JSON.parse(savedAttendanceData);
    } else {
        attendanceData = {
            leave: [],
            late: [],
            absent: []
        };
    }

    // 加载值日生数据
    const savedClassDuty = localStorage.getItem(`classDuty_${dateString}`);
    if (savedClassDuty) {
        classDuty = JSON.parse(savedClassDuty);
    }

    const savedAreaDuty = localStorage.getItem(`areaDuty_${dateString}`);
    if (savedAreaDuty) {
        areaDuty = JSON.parse(savedAreaDuty);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 班级名称编辑
    classNameEl.addEventListener('blur', function() {
        localStorage.setItem('className', this.textContent);
    });

    // 字体大小调整
    document.getElementById('font-decrease').addEventListener('click', function() {
        if (fontSizeBase > 12) {
            fontSizeBase -= 1;
            document.documentElement.style.fontSize = `${fontSizeBase}px`;
            document.documentElement.style.setProperty('--font-size-base', `${fontSizeBase}px`);
            localStorage.setItem('fontSize', fontSizeBase);
        }
    });

    document.getElementById('font-increase').addEventListener('click', function() {
        if (fontSizeBase < 24) {
            fontSizeBase += 1;
            document.documentElement.style.fontSize = `${fontSizeBase}px`;
            document.documentElement.style.setProperty('--font-size-base', `${fontSizeBase}px`);
            localStorage.setItem('fontSize', fontSizeBase);
        }
    });

    // 主题切换
    document.getElementById('theme-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        this.innerHTML = isDarkMode ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });

    // 日期选择
    const datePicker = document.getElementById('date-picker');
    datePicker.addEventListener('click', function() {
        // 销毁之前的实例
        if (this._flatpickr) {
            this._flatpickr.destroy();
        }
        
        // 创建新的日期选择器实例
        const picker = flatpickr(this, {
            defaultDate: currentDate,
            locale: 'zh',
            onChange: function(selectedDates) {
                if (selectedDates && selectedDates.length > 0) {
                    // 先保存当前日期的数据
                    const oldDateString = formatDate(currentDate);
                    localStorage.setItem(`homework_${oldDateString}`, JSON.stringify(homeworkData));
                    localStorage.setItem(`attendance_${oldDateString}`, JSON.stringify(attendanceData));
                    localStorage.setItem(`classDuty_${oldDateString}`, JSON.stringify(classDuty));
                    localStorage.setItem(`areaDuty_${oldDateString}`, JSON.stringify(areaDuty));
                    
                    // 更新当前日期
                    currentDate = selectedDates[0];
                    
                    // 更新日期显示
                    updateDateDisplay();
                    
                    // 重置数据
                    const newDateString = formatDate(currentDate);
                    
                    // 重新初始化数据结构
                    homeworkData = {};
                    subjects.forEach(subject => {
                        homeworkData[subject.id] = [];
                    });
                    
                    attendanceData = {
                        leave: [],
                        late: [],
                        absent: []
                    };
                    
                    classDuty = [];
                    areaDuty = [];
                    
                    // 加载新日期的数据
                    const savedHomeworkData = localStorage.getItem(`homework_${newDateString}`);
                    if (savedHomeworkData) {
                        homeworkData = JSON.parse(savedHomeworkData);
                    }
                    
                    const savedAttendanceData = localStorage.getItem(`attendance_${newDateString}`);
                    if (savedAttendanceData) {
                        attendanceData = JSON.parse(savedAttendanceData);
                    }
                    
                    const savedClassDuty = localStorage.getItem(`classDuty_${newDateString}`);
                    if (savedClassDuty) {
                        classDuty = JSON.parse(savedClassDuty);
                    }
                    
                    const savedAreaDuty = localStorage.getItem(`areaDuty_${newDateString}`);
                    if (savedAreaDuty) {
                        areaDuty = JSON.parse(savedAreaDuty);
                    }
                    
                    // 更新界面
                    renderSubjects();
                    updateHomeworkStats();
                    updateAttendanceStats();
                    
                    // 关闭日期选择器
                    picker.close();
                }
            }
        });
        
        this._flatpickr = picker;
        picker.open();
    });

    // 全屏切换
    document.getElementById('fullscreen-toggle').addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`全屏错误: ${err.message}`);
            });
            this.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.innerHTML = '<i class="bi bi-fullscreen"></i>';
            }
        }
    });

    // 数据导出
    document.getElementById('export-data').addEventListener('click', exportData);

    // 数据导入
    document.getElementById('import-data').addEventListener('click', function() {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', importData);

    // 出勤面板点击
    document.getElementById('attendance-panel').addEventListener('click', function() {
        openAttendanceModal();
    });

    // 关闭模态框按钮
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 获取当前按钮所在的模态框
            const modal = this.closest('.modal');
            if (modal) {
                // 只关闭当前模态框
                closeModal(modal);
            }
        });
    });

    // 取消按钮
    document.getElementById('cancel-homework').addEventListener('click', closeAllModals);
    document.getElementById('cancel-attendance').addEventListener('click', closeAllModals);
    document.getElementById('cancel-subject').addEventListener('click', closeAllModals);
    document.getElementById('cancel-add-student').addEventListener('click', function() {
        closeModal(addStudentModalEl);
    });

    // 作业表单提交
    document.getElementById('homework-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveHomework();
    });

    // 学科表单提交
    document.getElementById('subject-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addSubject();
    });

    // 学生表单提交
    document.getElementById('student-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addStudent();
    });

    // 出勤管理按钮
    document.getElementById('import-students').addEventListener('click', importStudents);
    document.getElementById('export-template').addEventListener('click', exportTemplate);
    document.getElementById('add-student').addEventListener('click', openAddStudentModal);
    document.getElementById('clear-attendance').addEventListener('click', clearAttendance);
    document.getElementById('clear-students').addEventListener('click', clearStudents);
    document.getElementById('save-attendance').addEventListener('click', saveAttendance);

    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// 设置可排序
function setupSortable() {
    new Sortable(subjectsContainerEl, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        filter: '.add-subject-card', // 不允许拖拽添加学科卡片
        onEnd: function() {
            // 更新学科顺序
            const subjectCards = subjectsContainerEl.querySelectorAll('.subject-card:not(.add-subject-card)');
            const newOrder = [];
            
            subjectCards.forEach(card => {
                const subjectId = card.dataset.subjectId;
                const subject = subjects.find(s => s.id === subjectId);
                if (subject) {
                    newOrder.push(subject);
                }
            });
            
            subjects = newOrder;
            saveSubjects();
        }
    });
}

// 渲染学科
function renderSubjects() {
    subjectsContainerEl.innerHTML = '';
    
    subjects.forEach(subject => {
        const subjectCard = createSubjectCard(subject);
        subjectsContainerEl.appendChild(subjectCard);
    });
    
    // 添加"添加学科"卡片
    const addSubjectCard = document.createElement('div');
    addSubjectCard.className = 'add-subject-card';
    addSubjectCard.innerHTML = `
        <i class="bi bi-plus-circle add-subject-icon"></i>
        <span>添加学科</span>
    `;
    addSubjectCard.addEventListener('click', openSubjectModal);
    subjectsContainerEl.appendChild(addSubjectCard);
}

// 创建学科卡片
function createSubjectCard(subject) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.dataset.subjectId = subject.id;
    card.style.borderTopColor = subject.color;
    
    const header = document.createElement('div');
    header.className = 'subject-header';
    
    const title = document.createElement('div');
    title.className = 'subject-title';
    title.textContent = subject.name;
    
    const actions = document.createElement('div');
    actions.className = 'subject-actions';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.title = '删除学科';
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm(`确定要删除${subject.name}学科吗？`)) {
            deleteSubject(subject.id);
        }
    });
    
    actions.appendChild(deleteBtn);
    header.appendChild(title);
    header.appendChild(actions);
    
    const homeworkList = document.createElement('ul');
    homeworkList.className = 'homework-list';
    
    // 渲染作业列表
    if (homeworkData[subject.id]) {
        homeworkData[subject.id].forEach(homework => {
            const homeworkItem = createHomeworkItem(homework, subject.id);
            homeworkList.appendChild(homeworkItem);
        });
    }
    
    card.appendChild(header);
    card.appendChild(homeworkList);
    
    // 点击卡片添加作业，但排除复选框和作业项的点击
    card.addEventListener('click', function(e) {
        // 检查点击的元素是否是复选框或其祖先元素是否包含homework-item类
        if (e.target.type === 'checkbox' || 
            e.target.closest('.homework-item') || 
            e.target.closest('.homework-actions')) {
            return; // 如果是复选框或作业项内的元素，不打开模态框
        }
        openHomeworkModal(subject.id);
    });
    
    return card;
}

// 创建作业项
function createHomeworkItem(homework, subjectId) {
    const item = document.createElement('li');
    item.className = 'homework-item';
    if (homework.completed) {
        item.classList.add('homework-completed');
    }
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'homework-checkbox';
    checkbox.checked = homework.completed;
    checkbox.addEventListener('change', function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        toggleHomeworkCompletion(subjectId, homework.id);
    });
    
    const content = document.createElement('div');
    content.className = 'homework-content';
    content.textContent = homework.content;
    
    // 添加点击事件阻止冒泡
    content.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    if (homework.deadline) {
        const deadline = document.createElement('div');
        deadline.className = 'homework-deadline';
        
        const deadlineDate = new Date(homework.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (deadlineDate < today) {
            deadline.classList.add('homework-overdue');
            deadline.textContent = `截止日期: ${formatDate(deadlineDate)} (已过期)`;
        } else if (deadlineDate.getTime() === today.getTime()) {
            deadline.classList.add('homework-due-soon');
            deadline.textContent = `截止日期: 今天`;
        } else if (deadlineDate.getTime() === tomorrow.getTime()) {
            deadline.classList.add('homework-due-soon');
            deadline.textContent = `截止日期: 明天`;
        } else {
            deadline.textContent = `截止日期: ${formatDate(deadlineDate)}`;
        }
        
        content.appendChild(deadline);
    }
    
    const actions = document.createElement('div');
    actions.className = 'homework-actions';
    
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    editBtn.title = '编辑作业';
    editBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openHomeworkModal(subjectId, homework.id);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.title = '删除作业';
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('确定要删除这个作业吗？')) {
            deleteHomework(subjectId, homework.id);
        }
    });
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    item.appendChild(checkbox);
    item.appendChild(content);
    item.appendChild(actions);
    
    return item;
}

// 打开作业模态框
function openHomeworkModal(subjectId, homeworkId = null) {
    const modalTitle = document.getElementById('modal-title');
    const homeworkContent = document.getElementById('homework-content');
    const homeworkDeadline = document.getElementById('homework-deadline');
    const editHomeworkId = document.getElementById('edit-homework-id');
    const editSubject = document.getElementById('edit-subject');
    
    // 设置日期选择器
    flatpickr(homeworkDeadline, {
        locale: 'zh',
        dateFormat: 'Y-m-d',
        allowInput: true
    });
    
    if (homeworkId) {
        // 编辑模式
        const homework = homeworkData[subjectId].find(h => h.id === homeworkId);
        if (homework) {
            modalTitle.textContent = '编辑作业';
            homeworkContent.value = homework.content;
            homeworkDeadline.value = homework.deadline || '';
            editHomeworkId.value = homeworkId;
            editSubject.value = subjectId;
        }
    } else {
        // 添加模式
        modalTitle.textContent = '添加作业';
        homeworkContent.value = '';
        homeworkDeadline.value = '';
        editHomeworkId.value = '';
        editSubject.value = subjectId;
    }
    
    homeworkModalEl.style.display = 'flex';
}

// 保存作业
function saveHomework() {
    const homeworkContent = document.getElementById('homework-content').value.trim();
    const homeworkDeadline = document.getElementById('homework-deadline').value;
    const editHomeworkId = document.getElementById('edit-homework-id').value;
    const subjectId = document.getElementById('edit-subject').value;
    
    if (!homeworkContent) {
        alert('请输入作业内容');
        return;
    }
    
    if (editHomeworkId) {
        // 编辑现有作业
        const index = homeworkData[subjectId].findIndex(h => h.id === editHomeworkId);
        if (index !== -1) {
            homeworkData[subjectId][index].content = homeworkContent;
            homeworkData[subjectId][index].deadline = homeworkDeadline || null;
        }
    } else {
        // 添加新作业
        const newHomework = {
            id: 'hw-' + Date.now(),
            content: homeworkContent,
            deadline: homeworkDeadline || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        if (!homeworkData[subjectId]) {
            homeworkData[subjectId] = [];
        }
        
        homeworkData[subjectId].push(newHomework);
    }
    
    saveHomeworkData();
    renderSubjects();
    updateHomeworkStats();
    closeAllModals();
}

// 删除作业
function deleteHomework(subjectId, homeworkId) {
    const index = homeworkData[subjectId].findIndex(h => h.id === homeworkId);
    if (index !== -1) {
        homeworkData[subjectId].splice(index, 1);
        saveHomeworkData();
        renderSubjects();
        updateHomeworkStats();
    }
}

// 切换作业完成状态
function toggleHomeworkCompletion(subjectId, homeworkId) {
    const index = homeworkData[subjectId].findIndex(h => h.id === homeworkId);
    if (index !== -1) {
        homeworkData[subjectId][index].completed = !homeworkData[subjectId][index].completed;
        saveHomeworkData();
        renderSubjects();
        updateHomeworkStats();
    }
}

// 更新作业统计
function updateHomeworkStats() {
    let total = 0;
    let completed = 0;
    let dueToday = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = formatDate(today);
    
    Object.values(homeworkData).forEach(homeworkList => {
        homeworkList.forEach(homework => {
            total++;
            if (homework.completed) {
                completed++;
            }
            
            if (homework.deadline) {
                // 使用格式化后的日期字符串进行比较，确保只比较年月日
                const deadlineString = homework.deadline;
                if (deadlineString === todayString && !homework.completed) {
                    dueToday++;
                }
            }
        });
    });
    
    totalHomeworkEl.textContent = total;
    completedHomeworkEl.textContent = completed;
    incompleteHomeworkEl.textContent = total - completed;
    dueTodayEl.textContent = dueToday;
}

// 打开学科模态框
function openSubjectModal() {
    document.getElementById('subject-name').value = '';
    document.getElementById('subject-color').value = '#4CAF50';
    subjectModalEl.style.display = 'flex';
}

// 添加学科
function addSubject() {
    const subjectName = document.getElementById('subject-name').value.trim();
    const subjectColor = document.getElementById('subject-color').value;
    
    if (!subjectName) {
        alert('请输入学科名称');
        return;
    }
    
    const newSubject = {
        id: 'subject-' + Date.now(),
        name: subjectName,
        color: subjectColor
    };
    
    subjects.push(newSubject);
    homeworkData[newSubject.id] = [];
    
    saveSubjects();
    saveHomeworkData();
    renderSubjects();
    closeAllModals();
}

// 删除学科
function deleteSubject(subjectId) {
    const index = subjects.findIndex(s => s.id === subjectId);
    if (index !== -1) {
        subjects.splice(index, 1);
        delete homeworkData[subjectId];
        
        saveSubjects();
        saveHomeworkData();
        renderSubjects();
        updateHomeworkStats();
    }
}

// 打开出勤模态框
function openAttendanceModal() {
    renderStudentGrid();
    renderDutySelections();
    attendanceModalEl.style.display = 'flex';
}

// 渲染学生网格
function renderStudentGrid() {
    studentGridEl.innerHTML = '';
    
    students.forEach(student => {
        const studentCard = createStudentCard(student);
        studentGridEl.appendChild(studentCard);
    });
}

// 创建学生卡片
function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    
    // 创建删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'student-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = '删除学生';
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // 阻止事件冒泡
        if (confirm(`确定要删除学生 ${student.name} 吗？`)) {
            deleteStudent(student.id);
        }
    });    
    
    // 创建包含姓名和学号的容器，添加更紧凑的样式
    const nameContainer = document.createElement('div');
    nameContainer.className = 'student-name-container compact';
    
    const name = document.createElement('div');
    name.className = 'student-name';
    name.textContent = student.name;
    
    const number = document.createElement('div');
    number.className = 'student-number';
    number.textContent = `#${student.number}`; // 使用#代替"学号:"，更简洁
    
    // 将姓名和学号添加到同一个容器中
    nameContainer.appendChild(name);
    nameContainer.appendChild(number);
    
    const status = document.createElement('div');
    status.className = 'student-status';
    
    // 请假复选框
    const leaveLabel = document.createElement('label');
    leaveLabel.className = 'status-checkbox';
    const leaveCheckbox = document.createElement('input');
    leaveCheckbox.type = 'checkbox';
    leaveCheckbox.name = 'leave';
    leaveCheckbox.checked = attendanceData.leave.includes(student.id);
    leaveCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // 取消其他状态
            card.querySelector('input[name="late"]').checked = false;
            card.querySelector('input[name="absent"]').checked = false;
        }
    });
    leaveLabel.appendChild(leaveCheckbox);
    leaveLabel.appendChild(document.createTextNode('请假'));
        
    // 迟到复选框
    const lateLabel = document.createElement('label');
    lateLabel.className = 'status-checkbox';
    const lateCheckbox = document.createElement('input');
    lateCheckbox.type = 'checkbox';
    lateCheckbox.name = 'late';
    lateCheckbox.checked = attendanceData.late.includes(student.id);
    lateCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // 取消其他状态
            card.querySelector('input[name="leave"]').checked = false;
            card.querySelector('input[name="absent"]').checked = false;
        }
    });
    lateLabel.appendChild(lateCheckbox);
    lateLabel.appendChild(document.createTextNode('迟到'));
    
    // 旷课复选框
    const absentLabel = document.createElement('label');
    absentLabel.className = 'status-checkbox';
    const absentCheckbox = document.createElement('input');
    absentCheckbox.type = 'checkbox';
    absentCheckbox.name = 'absent';
    absentCheckbox.checked = attendanceData.absent.includes(student.id);
    absentCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // 取消其他状态
            card.querySelector('input[name="leave"]').checked = false;
            card.querySelector('input[name="late"]').checked = false;
        }
    });
    absentLabel.appendChild(absentCheckbox);
    absentLabel.appendChild(document.createTextNode('旷课'));
    
    status.appendChild(leaveLabel);
    status.appendChild(lateLabel);
    status.appendChild(absentLabel);
    
    card.appendChild(nameContainer);
    card.appendChild(status);
    card.appendChild(deleteBtn); // 添加删除按钮到卡片
    card.dataset.studentId = student.id;
    
    return card;
}

// 添加删除学生的函数
function deleteStudent(studentId) {
    // 从学生数组中删除
    const index = students.findIndex(s => s.id === studentId);
    if (index !== -1) {
        students.splice(index, 1);
        
        // 从出勤数据中删除
        attendanceData.leave = attendanceData.leave.filter(id => id !== studentId);
        attendanceData.late = attendanceData.late.filter(id => id !== studentId);
        attendanceData.absent = attendanceData.absent.filter(id => id !== studentId);
        
        // 从值日生数据中删除
        classDuty = classDuty.filter(id => id !== studentId);
        areaDuty = areaDuty.filter(id => id !== studentId);
        
        // 保存数据
        saveStudents();
        saveAttendanceData();
        saveClassDuty();
        saveAreaDuty();
        
        // 重新渲染
        renderStudentGrid();
        renderDutySelections();
        updateAttendanceStats();
    }
}

// 渲染值日生选择
function renderDutySelections() {
    classDutySelectionEl.innerHTML = '';
    areaDutySelectionEl.innerHTML = '';
    
    students.forEach(student => {
        // 班级值日选择
        const classDutyLabel = document.createElement('label');
        classDutyLabel.className = 'duty-checkbox';
        const classDutyCheckbox = document.createElement('input');
        classDutyCheckbox.type = 'checkbox';
        classDutyCheckbox.name = 'class-duty';
        classDutyCheckbox.value = student.id;
        classDutyCheckbox.checked = classDuty.includes(student.id);
        classDutyLabel.appendChild(classDutyCheckbox);
        classDutyLabel.appendChild(document.createTextNode(student.name));
        classDutySelectionEl.appendChild(classDutyLabel);
        
        // 包干区值日选择
        const areaDutyLabel = document.createElement('label');
        areaDutyLabel.className = 'duty-checkbox';
        const areaDutyCheckbox = document.createElement('input');
        areaDutyCheckbox.type = 'checkbox';
        areaDutyCheckbox.name = 'area-duty';
        areaDutyCheckbox.value = student.id;
        areaDutyCheckbox.checked = areaDuty.includes(student.id);
        areaDutyLabel.appendChild(areaDutyCheckbox);
        areaDutyLabel.appendChild(document.createTextNode(student.name));
        areaDutySelectionEl.appendChild(areaDutyLabel);
    });
}

// 打开添加学生模态框
function openAddStudentModal() {
    document.getElementById('student-name').value = '';
    document.getElementById('student-number').value = '';
    addStudentModalEl.style.display = 'flex';
}

// 添加学生
function addStudent() {
    const studentName = document.getElementById('student-name').value.trim();
    const studentNumber = document.getElementById('student-number').value.trim();
    
    if (!studentName || !studentNumber) {
        alert('请输入学生姓名和学号');
        return;
    }
    
    // 检查学号是否已存在
    if (students.some(s => s.number === studentNumber)) {
        alert('该学号已存在');
        return;
    }
    
    const newStudent = {
        id: 'student-' + Date.now(),
        name: studentName,
        number: studentNumber
    };
    
    students.push(newStudent);
    saveStudents();
    
    closeModal(addStudentModalEl);
    renderStudentGrid();
    renderDutySelections();
}

// 导入学生
function importStudents() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedStudents = JSON.parse(e.target.result);
                
                if (Array.isArray(importedStudents) && importedStudents.every(s => s.name && s.number)) {
                    if (confirm(`确定要导入${importedStudents.length}名学生吗？这将覆盖现有名单。`)) {
                        students = importedStudents.map(s => ({
                            id: 'student-' + Date.now() + Math.floor(Math.random() * 1000),
                            name: s.name,
                            number: s.number
                        }));
                        
                        saveStudents();
                        renderStudentGrid();
                        renderDutySelections();
                        updateAttendanceStats();
                        
                        alert('导入成功');
                    }
                } else {
                    alert('导入的文件格式不正确');
                }
            } catch (error) {
                alert('导入失败: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// 导出模板
function exportTemplate() {
    const template = [
        { name: '张三', number: '1' },
        { name: '李四', number: '2' },
        { name: '王五', number: '3' }
    ];
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = '学生名单模板.json';
    a.click();
    
    URL.revokeObjectURL(url);
}

// 清空出勤勾选
function clearAttendance() {
    if (confirm('确定要清空所有出勤勾选吗？')) {
        attendanceData = {
            leave: [],
            late: [],
            absent: []
        };
        
        classDuty = [];
        areaDuty = [];
        
        saveAttendanceData();
        saveClassDuty();
        saveAreaDuty();
        
        renderStudentGrid();
        renderDutySelections();
        updateAttendanceStats();
    }
}

// 清空学生名单
function clearStudents() {
    if (confirm('确定要清空所有学生名单吗？这将同时清空出勤记录。')) {
        students = [];
        attendanceData = {
            leave: [],
            late: [],
            absent: []
        };
        
        classDuty = [];
        areaDuty = [];
        
        saveStudents();
        saveAttendanceData();
        saveClassDuty();
        saveAreaDuty();
        
        renderStudentGrid();
        renderDutySelections();
        updateAttendanceStats();
    }
}

// 保存出勤数据
function saveAttendance() {
    // 收集出勤数据
    const leaveIds = [];
    const lateIds = [];
    const absentIds = [];
    
    document.querySelectorAll('.student-card').forEach(card => {
        const studentId = card.dataset.studentId;
        
        if (card.querySelector('input[name="leave"]').checked) {
            leaveIds.push(studentId);
        }
        
        if (card.querySelector('input[name="late"]').checked) {
            lateIds.push(studentId);
        }
        
        if (card.querySelector('input[name="absent"]').checked) {
            absentIds.push(studentId);
        }
    });
    
    attendanceData = {
        leave: leaveIds,
        late: lateIds,
        absent: absentIds
    };
    
    // 收集值日生数据
    const newClassDuty = [];
    document.querySelectorAll('input[name="class-duty"]:checked').forEach(checkbox => {
        newClassDuty.push(checkbox.value);
    });
    
    const newAreaDuty = [];
    document.querySelectorAll('input[name="area-duty"]:checked').forEach(checkbox => {
        newAreaDuty.push(checkbox.value);
    });
    
    classDuty = newClassDuty;
    areaDuty = newAreaDuty;
    
    saveAttendanceData();
    saveClassDuty();
    saveAreaDuty();
    updateAttendanceStats();
    
    closeAllModals();
}

// 更新出勤统计
function updateAttendanceStats() {
    // 更新人数统计
    const totalStudentsCount = students.length;
    const leaveCount = attendanceData.leave.length;
    const lateCount = attendanceData.late.length;
    const absentCount = attendanceData.absent.length;
    const presentCount = totalStudentsCount - leaveCount - absentCount;
    
    totalStudentsEl.textContent = totalStudentsCount;
    presentStudentsEl.textContent = presentCount;
    leaveCountEl.textContent = leaveCount;
    lateCountEl.textContent = lateCount;
    absentCountEl.textContent = absentCount;
    
    // 更新名单显示
    leaveListEl.innerHTML = '';
    lateListEl.innerHTML = '';
    absentListEl.innerHTML = '';
    classDutyListEl.innerHTML = '';
    areaDutyListEl.innerHTML = '';
    
    // 请假名单
    attendanceData.leave.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const tag = document.createElement('span');
            tag.className = 'student-tag';
            tag.textContent = student.name;
            leaveListEl.appendChild(tag);
        }
    });
    
    // 迟到名单
    attendanceData.late.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const tag = document.createElement('span');
            tag.className = 'student-tag';
            tag.textContent = student.name;
            lateListEl.appendChild(tag);
        }
    });
    
    // 旷课名单
    attendanceData.absent.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const tag = document.createElement('span');
            tag.className = 'student-tag';
            tag.textContent = student.name;
            absentListEl.appendChild(tag);
        }
    });
    
    // 班级值日名单
    classDuty.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const tag = document.createElement('span');
            tag.className = 'student-tag';
            tag.textContent = student.name;
            classDutyListEl.appendChild(tag);
        }
    });
    
    // 包干区值日名单
    areaDuty.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            const tag = document.createElement('span');
            tag.className = 'student-tag';
            tag.textContent = student.name;
            areaDutyListEl.appendChild(tag);
        }
    });
}

// 导出数据
function exportData() {
    const dateString = formatDate(currentDate);
    
    const data = {
        className: classNameEl.textContent,
        date: dateString,
        subjects: subjects,
        students: students,
        homework: homeworkData,
        attendance: attendanceData,
        classDuty: classDuty,
        areaDuty: areaDuty
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `班级数据_${dateString}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// 导入数据
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (confirm('确定要导入数据吗？这将覆盖当前数据。')) {
                // 导入班级名称
                if (importedData.className) {
                    classNameEl.textContent = importedData.className;
                    localStorage.setItem('className', importedData.className);
                }
                
                // 导入学科
                if (Array.isArray(importedData.subjects)) {
                    subjects = importedData.subjects;
                    saveSubjects();
                }
                
                // 导入学生
                if (Array.isArray(importedData.students)) {
                    students = importedData.students;
                    saveStudents();
                }
                
                // 导入作业
                if (importedData.homework) {
                    homeworkData = importedData.homework;
                    saveHomeworkData();
                }
                
                // 导入出勤
                if (importedData.attendance) {
                    attendanceData = importedData.attendance;
                    saveAttendanceData();
                }
                
                // 导入值日生
                if (Array.isArray(importedData.classDuty)) {
                    classDuty = importedData.classDuty;
                    saveClassDuty();
                }
                
                if (Array.isArray(importedData.areaDuty)) {
                    areaDuty = importedData.areaDuty;
                    saveAreaDuty();
                }
                
                // 刷新界面
                renderSubjects();
                updateHomeworkStats();
                updateAttendanceStats();
                
                alert('数据导入成功');
            }
        } catch (error) {
            alert('导入失败: ' + error.message);
        }
    };
    
    reader.readAsText(file);
    
    // 重置文件输入，以便可以重复选择同一个文件
    e.target.value = '';
}

// 保存学科数据
function saveSubjects() {
    localStorage.setItem('subjects', JSON.stringify(subjects));
}

// 保存学生数据
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

// 保存作业数据
function saveHomeworkData() {
    const dateString = formatDate(currentDate);
    localStorage.setItem(`homework_${dateString}`, JSON.stringify(homeworkData));
}

// 保存出勤数据
function saveAttendanceData() {
    const dateString = formatDate(currentDate);
    localStorage.setItem(`attendance_${dateString}`, JSON.stringify(attendanceData));
}

// 保存班级值日数据
function saveClassDuty() {
    const dateString = formatDate(currentDate);
    localStorage.setItem(`classDuty_${dateString}`, JSON.stringify(classDuty));
}

// 保存包干区值日数据
function saveAreaDuty() {
    const dateString = formatDate(currentDate);
    localStorage.setItem(`areaDuty_${dateString}`, JSON.stringify(areaDuty));
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 关闭单个模态框
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}

// 关闭所有模态框
function closeAllModals() {
    homeworkModalEl.style.display = 'none';
    attendanceModalEl.style.display = 'none';
    subjectModalEl.style.display = 'none';
    addStudentModalEl.style.display = 'none';
}

// 关闭特定模态框
function closeModal(modalEl) {
    modalEl.style.display = 'none';
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);
