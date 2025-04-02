// 全局变量
let currentFontSize = 16;
const fontSizeStep = 2;
const minFontSize = 12;
const maxFontSize = 24;
let currentDate = new Date();
let homeworkData = {};
let studentsData = {
    list: [],
    leave: [],
    late: [],
    absent: [],
    classroomDuty: [],
    areaDuty: []
};

// 学科列表
const subjects = [
    { id: 'chinese', name: '语文', color: '#e57373' },
    { id: 'math', name: '数学', color: '#64b5f6' },
    { id: 'english', name: '英语', color: '#81c784' },
    { id: 'physics', name: '物理', color: '#ffb74d' },
    { id: 'chemistry', name: '化学', color: '#ba68c8' },
    { id: 'biology', name: '生物', color: '#4db6ac' },
    { id: 'politics', name: '政治', color: '#f06292' },
    { id: 'history', name: '历史', color: '#9575cd' },
    { id: 'geography', name: '地理', color: '#4fc3f7' },
    { id: 'other', name: '其他', color: '#a1887f' }
];

// DOM 元素
const elements = {
    currentDate: document.getElementById('current-date'),
    className: document.getElementById('class-name'),
    saveClassName: document.getElementById('save-class-name'),
    fontIncrease: document.getElementById('font-increase'),
    fontDecrease: document.getElementById('font-decrease'),
    toggleTheme: document.getElementById('toggle-theme'),
    datePicker: document.getElementById('date-picker'),
    dateInput: document.getElementById('date-input'),
    fullscreen: document.getElementById('fullscreen'),
    totalHomework: document.getElementById('total-homework'),
    completedHomework: document.getElementById('completed-homework'),
    incompleteHomework: document.getElementById('incomplete-homework'),
    dueToday: document.getElementById('due-today'),
    subjectsContainer: document.querySelector('.subjects-container'),
    totalStudents: document.getElementById('total-students'),
    presentStudents: document.getElementById('present-students'),
    leaveList: document.getElementById('leave-list'),
    lateList: document.getElementById('late-list'),
    absentList: document.getElementById('absent-list'),
    classroomDutyList: document.getElementById('classroom-duty-list'),
    areaDutyList: document.getElementById('area-duty-list'),
    manageAttendance: document.getElementById('manage-attendance'),
    addHomeworkModal: document.getElementById('add-homework-modal'),
    attendanceModal: document.getElementById('attendance-modal'),
    dataModal: document.getElementById('data-modal'),
    closeButtons: document.querySelectorAll('.close'),
    addHomeworkForm: document.getElementById('add-homework-form'),
    subjectInput: document.getElementById('subject-input'),
    editHomeworkId: document.getElementById('edit-homework-id'),
    homeworkTitle: document.getElementById('homework-title'),
    homeworkDescription: document.getElementById('homework-description'),
    homeworkDueDate: document.getElementById('homework-due-date'),
    importStudents: document.getElementById('import-students'),
    exportStudents: document.getElementById('export-students'),
    downloadTemplate: document.getElementById('download-template'),
    clearStudents: document.getElementById('clear-students'),
    importStudentsFile: document.getElementById('import-students-file'),
    studentCardsContainer: document.querySelector('.student-cards-container'),
    dataManagement: document.getElementById('data-management'),
    exportData: document.getElementById('export-data'),
    importData: document.getElementById('import-data'),
    importDataFile: document.getElementById('import-data-file')
};

// 初始化
function init() {
    loadData();
    updateDateDisplay();
    renderSubjects();
    updateHomeworkStats();
    updateAttendance();
    setupEventListeners();
}

// 加载数据
function loadData() {
    // 加载班级名称
    const savedClassName = localStorage.getItem('className');
    if (savedClassName) {
        elements.className.textContent = savedClassName;
    }

    // 加载主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        elements.toggleTheme.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // 加载字体大小
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        currentFontSize = parseInt(savedFontSize);
        document.documentElement.style.setProperty('--font-size-base', `${currentFontSize}px`);
    }

    // 加载作业数据
    const dateString = formatDate(currentDate);
    const savedHomeworkData = localStorage.getItem(`homeworkData_${dateString}`);
    if (savedHomeworkData) {
        homeworkData = JSON.parse(savedHomeworkData);
    } else {
        // 初始化空的作业数据结构
        subjects.forEach(subject => {
            homeworkData[subject.id] = [];
        });
        saveHomeworkData();
    }

    // 加载学生数据
    const savedStudentsData = localStorage.getItem(`studentsData_${dateString}`);
    if (savedStudentsData) {
        studentsData = JSON.parse(savedStudentsData);
    } else {
        // 检查是否有前一天的数据可以继承
        const yesterday = new Date(currentDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = formatDate(yesterday);
        const yesterdayStudentsData = localStorage.getItem(`studentsData_${yesterdayString}`);
        
        if (yesterdayStudentsData) {
            // 继承学生名单，但清空出勤状态
            const prevData = JSON.parse(yesterdayStudentsData);
            studentsData.list = prevData.list;
            saveStudentsData();
        }
    }
}

// 更新日期显示
function updateDateDisplay() {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    elements.currentDate.textContent = currentDate.toLocaleDateString('zh-CN', options);
    
    // 设置日期选择器的值
    elements.dateInput.value = formatDate(currentDate, '-');
}

// 格式化日期为 YYYY-MM-DD 或 YYYYMMDD
function formatDate(date, separator = '') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${separator}${month}${separator}${day}`;
}

// 渲染学科卡片
function renderSubjects() {
    elements.subjectsContainer.innerHTML = '';
    
    subjects.forEach(subject => {
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-card';
        subjectCard.style.borderTop = `3px solid ${subject.color}`;
        
        const subjectHeader = document.createElement('div');
        subjectHeader.className = 'subject-header';
        
        const subjectTitle = document.createElement('div');
        subjectTitle.className = 'subject-title';
        subjectTitle.textContent = subject.name;
        
        const addButton = document.createElement('button');
        addButton.className = 'add-homework';
        addButton.innerHTML = '<i class="fas fa-plus"></i>';
        addButton.setAttribute('data-subject', subject.id);
        addButton.addEventListener('click', () => openAddHomeworkModal(subject.id));
        
        subjectHeader.appendChild(subjectTitle);
        subjectHeader.appendChild(addButton);
        
        const homeworkList = document.createElement('ul');
        homeworkList.className = 'homework-list';
        
        // 渲染该学科的作业
        if (homeworkData[subject.id] && homeworkData[subject.id].length > 0) {
            homeworkData[subject.id].forEach(homework => {
                const homeworkItem = createHomeworkItem(homework, subject.id);
                homeworkList.appendChild(homeworkItem);
            });
        } else {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = '暂无作业';
            homeworkList.appendChild(emptyMessage);
        }
        
        subjectCard.appendChild(subjectHeader);
        subjectCard.appendChild(homeworkList);
        
        elements.subjectsContainer.appendChild(subjectCard);
    });
}

// 创建作业项
function createHomeworkItem(homework, subjectId) {
    const homeworkItem = document.createElement('li');
    homeworkItem.className = 'homework-item';
    if (homework.completed) {
        homeworkItem.classList.add('homework-completed');
    }
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'homework-checkbox';
    checkbox.checked = homework.completed;
    checkbox.addEventListener('change', () => toggleHomeworkCompletion(homework.id, subjectId));
    
    const content = document.createElement('div');
    content.className = 'homework-content';
    
    const title = document.createElement('div');
    title.className = 'homework-title';
    title.textContent = homework.title;
    
    const description = document.createElement('div');
    description.className = 'homework-description';
    description.textContent = homework.description || '无描述';
    
    const dueDate = document.createElement('div');
    dueDate.className = 'homework-due-date';
    
    // 检查是否今日截止
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(homework.dueDate);
    due.setHours(0, 0, 0, 0);
    
    if (due.getTime() === today.getTime()) {
        dueDate.classList.add('homework-due-today');
        dueDate.textContent = '今日截止';
    } else if (due < today) {
        dueDate.classList.add('homework-due-today');
        dueDate.textContent = '已逾期';
    } else {
        dueDate.textContent = `截止日期: ${homework.dueDate}`;
    }
    
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(dueDate);
    
    const actions = document.createElement('div');
    actions.className = 'homework-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'edit-homework';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.addEventListener('click', () => openEditHomeworkModal(homework, subjectId));
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-homework';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', () => deleteHomework(homework.id, subjectId));
    
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    
    homeworkItem.appendChild(checkbox);
    homeworkItem.appendChild(content);
    homeworkItem.appendChild(actions);
    
    return homeworkItem;
}

// 切换作业完成状态
function toggleHomeworkCompletion(homeworkId, subjectId) {
    const homeworkIndex = homeworkData[subjectId].findIndex(hw => hw.id === homeworkId);
    if (homeworkIndex !== -1) {
        homeworkData[subjectId][homeworkIndex].completed = !homeworkData[subjectId][homeworkIndex].completed;
        saveHomeworkData();
        renderSubjects();
        updateHomeworkStats();
    }
}

// 打开添加作业模态框
function openAddHomeworkModal(subjectId) {
    elements.subjectInput.value = subjectId;
    elements.editHomeworkId.value = '';
    elements.homeworkTitle.value = '';
    elements.homeworkDescription.value = '';
    elements.homeworkDueDate.value = formatDate(new Date(), '-');
    elements.addHomeworkModal.style.display = 'block';
}

// 打开编辑作业模态框
function openEditHomeworkModal(homework, subjectId) {
    elements.subjectInput.value = subjectId;
    elements.editHomeworkId.value = homework.id;
    elements.homeworkTitle.value = homework.title;
    elements.homeworkDescription.value = homework.description || '';
    elements.homeworkDueDate.value = homework.dueDate;
    elements.addHomeworkModal.style.display = 'block';
}

// 删除作业
function deleteHomework(homeworkId, subjectId) {
    if (confirm('确定要删除这个作业吗？')) {
        homeworkData[subjectId] = homeworkData[subjectId].filter(hw => hw.id !== homeworkId);
        saveHomeworkData();
        renderSubjects();
        updateHomeworkStats();
    }
}

// 保存作业数据
function saveHomeworkData() {
    const dateString = formatDate(currentDate);
    localStorage.setItem(`homeworkData_${dateString}`, JSON.stringify(homeworkData));
}

// 更新作业统计
function updateHomeworkStats() {
    let total = 0;
    let completed = 0;
    let dueToday = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    subjects.forEach(subject => {
        if (homeworkData[subject.id]) {
            homeworkData[subject.id].forEach(homework => {
                total++;
                if (homework.completed) {
                    completed++;
                }
                
                const due = new Date(homework.dueDate);
                due.setHours(0, 0, 0, 0);
                if (due.getTime() === today.getTime()) {
                    dueToday++;
                }
            });
        }
    });
    
    elements.totalHomework.textContent = total;
    elements.completedHomework.textContent = completed;
    elements.incompleteHomework.textContent = total - completed;
    elements.dueToday.textContent = dueToday;
}

// 更新出勤情况
function updateAttendance() {
    // 修改这里，增加实到人数和应到人数之间的间距
    const attendanceStats = document.querySelector('.attendance-stats');
    if (attendanceStats) {
        attendanceStats.innerHTML = `
            <p>应到人数: <span id="total-students">${studentsData.list.length}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
               实到人数: <span id="present-students">${studentsData.list.length - studentsData.leave.length - studentsData.absent.length}</span></p>
        `;
        // 更新DOM元素引用
        elements.totalStudents = document.getElementById('total-students');
        elements.presentStudents = document.getElementById('present-students');
    } else {
        // 如果找不到元素，使用原来的方式更新
        elements.totalStudents.textContent = studentsData.list.length;
        elements.presentStudents.textContent = studentsData.list.length - studentsData.leave.length - studentsData.absent.length;
    }
    
    // 更新请假名单
    elements.leaveList.innerHTML = '';
    elements.leaveList.className = 'four-column-list'; // 添加四列样式
    studentsData.leave.forEach(studentId => {
        const student = studentsData.list.find(s => s.id === studentId);
        if (student) {
            const li = document.createElement('li');
            li.textContent = student.name;
            elements.leaveList.appendChild(li);
        }
    });
    
    // 更新迟到名单
    elements.lateList.innerHTML = '';
    elements.lateList.className = 'four-column-list'; // 添加四列样式
    studentsData.late.forEach(studentId => {
        const student = studentsData.list.find(s => s.id === studentId);
        if (student) {
            const li = document.createElement('li');
            li.textContent = student.name;
            elements.lateList.appendChild(li);
        }
    });
    
    // 更新旷课名单
    elements.absentList.innerHTML = '';
    elements.absentList.className = 'four-column-list'; // 添加四列样式
    studentsData.absent.forEach(studentId => {
        const student = studentsData.list.find(s => s.id === studentId);
        if (student) {
            const li = document.createElement('li');
            li.textContent = student.name;
            elements.absentList.appendChild(li);
        }
    });
    
    // 更新班级值日生
    elements.classroomDutyList.innerHTML = '';
    elements.classroomDutyList.className = 'two-column-list'; // 添加两列样式
    studentsData.classroomDuty.forEach(studentId => {
        const student = studentsData.list.find(s => s.id === studentId);
        if (student) {
            const li = document.createElement('li');
            li.textContent = student.name;
            elements.classroomDutyList.appendChild(li);
        }
    });
    
    // 更新包干区值日生
    elements.areaDutyList.innerHTML = '';
    elements.areaDutyList.className = 'two-column-list'; // 添加两列样式
    studentsData.areaDuty.forEach(studentId => {
        const student = studentsData.list.find(s => s.id === studentId);
        if (student) {
            const li = document.createElement('li');
            li.textContent = student.name;
            elements.areaDutyList.appendChild(li);
        }
    });
}

// 保存学生数据
function saveStudentsData() {
    const dateString = formatDate(currentDate);
    localStorage.setItem(`studentsData_${dateString}`, JSON.stringify(studentsData));
}

// 打开出勤管理模态框
function openAttendanceModal() {
    renderStudentCards();
    
    // 检查是否已经存在清除按钮，如果不存在则添加
    if (!document.getElementById('clear-all-attendance')) {
        const attendanceActions = document.querySelector('.attendance-actions');
        if (attendanceActions) {
            const clearButton = document.createElement('button');
            clearButton.id = 'clear-all-attendance';
            clearButton.className = 'btn-danger';
            clearButton.textContent = '清除全部勾选';
            clearButton.addEventListener('click', clearAllAttendance);
            attendanceActions.appendChild(clearButton);
        }
    }
    
    elements.attendanceModal.style.display = 'block';
}

// 清除全部勾选状态
function clearAllAttendance() {    
        // 清空所有出勤相关数组
        studentsData.leave = [];
        studentsData.late = [];
        studentsData.absent = [];
        studentsData.classroomDuty = [];
        studentsData.areaDuty = [];
        
        // 保存数据并更新界面
        saveStudentsData();
        renderStudentCards();
        updateAttendance();
        
}

// 渲染学生卡片
function renderStudentCards() {
    elements.studentCardsContainer.innerHTML = '';
    
    studentsData.list.forEach(student => {
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        
        const studentName = document.createElement('div');
        studentName.className = 'student-name';
        studentName.textContent = student.name;
        
        const studentStatus = document.createElement('div');
        studentStatus.className = 'student-status';
        
        // 请假复选框
        const leaveLabel = document.createElement('label');
        const leaveCheckbox = document.createElement('input');
        leaveCheckbox.type = 'checkbox';
        leaveCheckbox.checked = studentsData.leave.includes(student.id);
        leaveCheckbox.addEventListener('change', () => toggleStudentStatus(student.id, 'leave', leaveCheckbox.checked));
        leaveLabel.appendChild(leaveCheckbox);
        leaveLabel.appendChild(document.createTextNode('请假'));
        
        // 迟到复选框
        const lateLabel = document.createElement('label');
        const lateCheckbox = document.createElement('input');
        lateCheckbox.type = 'checkbox';
        lateCheckbox.checked = studentsData.late.includes(student.id);
        lateCheckbox.addEventListener('change', () => toggleStudentStatus(student.id, 'late', lateCheckbox.checked));
        lateLabel.appendChild(lateCheckbox);
        lateLabel.appendChild(document.createTextNode('迟到'));
        
        // 旷课复选框
        const absentLabel = document.createElement('label');
        const absentCheckbox = document.createElement('input');
        absentCheckbox.type = 'checkbox';
        absentCheckbox.checked = studentsData.absent.includes(student.id);
        absentCheckbox.addEventListener('change', () => toggleStudentStatus(student.id, 'absent', absentCheckbox.checked));
        absentLabel.appendChild(absentCheckbox);
        absentLabel.appendChild(document.createTextNode('旷课'));
        
        // 班级值日复选框
        const classroomDutyLabel = document.createElement('label');
        const classroomDutyCheckbox = document.createElement('input');
        classroomDutyCheckbox.type = 'checkbox';
        classroomDutyCheckbox.checked = studentsData.classroomDuty.includes(student.id);
        classroomDutyCheckbox.addEventListener('change', () => toggleStudentStatus(student.id, 'classroomDuty', classroomDutyCheckbox.checked));
        classroomDutyLabel.appendChild(classroomDutyCheckbox);
        classroomDutyLabel.appendChild(document.createTextNode('班级值日'));
        
        // 包干区值日复选框
        const areaDutyLabel = document.createElement('label');
        const areaDutyCheckbox = document.createElement('input');
        areaDutyCheckbox.type = 'checkbox';
        areaDutyCheckbox.checked = studentsData.areaDuty.includes(student.id);
        areaDutyCheckbox.addEventListener('change', () => toggleStudentStatus(student.id, 'areaDuty', areaDutyCheckbox.checked));
        areaDutyLabel.appendChild(areaDutyCheckbox);
        areaDutyLabel.appendChild(document.createTextNode('包干区值日'));
        
        studentStatus.appendChild(leaveLabel);
        studentStatus.appendChild(lateLabel);
        studentStatus.appendChild(absentLabel);
        studentStatus.appendChild(classroomDutyLabel);
        studentStatus.appendChild(areaDutyLabel);
        
        studentCard.appendChild(studentName);
        studentCard.appendChild(studentStatus);
        
        elements.studentCardsContainer.appendChild(studentCard);
    });
}

// 切换学生状态
function toggleStudentStatus(studentId, statusType, isChecked) {
    if (isChecked) {
        // 添加到对应状态列表
        if (!studentsData[statusType].includes(studentId)) {
            studentsData[statusType].push(studentId);
        }
        
        // 如果是请假或旷课，确保不在另一个列表中
        if (statusType === 'leave' || statusType === 'absent') {
            const otherType = statusType === 'leave' ? 'absent' : 'leave';
            studentsData[otherType] = studentsData[otherType].filter(id => id !== studentId);
        }
    } else {
        // 从状态列表中移除
        studentsData[statusType] = studentsData[statusType].filter(id => id !== studentId);
    }
    
    saveStudentsData();
    updateAttendance();
}

// 导入学生名单
function importStudents() {
    elements.importStudentsFile.click();
}

// 处理导入的学生名单文件
function handleImportStudentsFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                studentsData.list = importedData;
                saveStudentsData();
                renderStudentCards();
                updateAttendance();
                alert('学生名单导入成功！');
            } else {
                alert('导入的数据格式不正确！');
            }
        } catch (error) {
            alert('导入失败：' + error.message);
        }
    };
    reader.readAsText(file);
}

// 导出学生名单
function exportStudents() {
    const dataStr = JSON.stringify(studentsData.list, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `学生名单_${formatDate(currentDate)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
}

// 生成示例学生名单模板
function generateStudentTemplate() {
    const templateStudents = [
        { id: "1", name: "张三" },
        { id: "2", name: "李四" },
        { id: "3", name: "王五" },
        { id: "4", name: "赵六" },
        { id: "5", name: "钱七" }
    ];
    
    const dataStr = JSON.stringify(templateStudents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `学生名单模板.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    alert('学生名单模板已下载，请按照模板格式填写后导入。\n格式说明：\n1. id: 学生唯一标识符\n2. name: 学生姓名');
}

// 清空学生名单
function clearStudents() {
    if (confirm('确定要清空学生名单吗？这将删除所有学生数据！')) {
        studentsData = {
            list: [],
            leave: [],
            late: [],
            absent: [],
            classroomDuty: [],
            areaDuty: []
        };
        saveStudentsData();
        renderStudentCards();
        updateAttendance();
        alert('学生名单已清空！');
    }
}

// 导出所有数据
function exportAllData() {
    // 收集所有数据
    const allData = {
        className: elements.className.textContent,
        currentDate: formatDate(currentDate),
        homeworkData: {},
        studentsData: {}
    };
    
    // 获取所有日期的作业数据
    for (let key in localStorage) {
        if (key.startsWith('homeworkData_')) {
            const dateKey = key.replace('homeworkData_', '');
            allData.homeworkData[dateKey] = JSON.parse(localStorage.getItem(key));
        } else if (key.startsWith('studentsData_')) {
            const dateKey = key.replace('studentsData_', '');
            allData.studentsData[dateKey] = JSON.parse(localStorage.getItem(key));
        }
    }
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `班级数据备份_${formatDate(currentDate)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
}

// 导入所有数据
function importAllData() {
    elements.importDataFile.click();
}

// 处理导入的数据文件
function handleImportDataFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // 导入班级名称
            if (importedData.className) {
                elements.className.textContent = importedData.className;
                localStorage.setItem('className', importedData.className);
            }
            
            // 导入作业数据
            if (importedData.homeworkData) {
                for (let dateKey in importedData.homeworkData) {
                    localStorage.setItem(`homeworkData_${dateKey}`, JSON.stringify(importedData.homeworkData[dateKey]));
                }
            }
            
            // 导入学生数据
            if (importedData.studentsData) {
                for (let dateKey in importedData.studentsData) {
                    localStorage.setItem(`studentsData_${dateKey}`, JSON.stringify(importedData.studentsData[dateKey]));
                }
            }
            
            // 重新加载当前日期的数据
            loadData();
            renderSubjects();
            updateHomeworkStats();
            updateAttendance();
            
            alert('数据导入成功！');
        } catch (error) {
            alert('导入失败：' + error.message);
        }
    };
    reader.readAsText(file);
}

// 设置事件监听器
function setupEventListeners() {
    // 保存班级名称
    elements.saveClassName.addEventListener('click', () => {
        localStorage.setItem('className', elements.className.textContent);
        alert('班级名称已保存！');
    });
    
    // 增大字体
elements.fontIncrease.addEventListener('click', () => {
    if (currentFontSize < maxFontSize) {
        currentFontSize += fontSizeStep;
        document.documentElement.style.setProperty('--font-size-base', `${currentFontSize}px`);
        localStorage.setItem('fontSize', currentFontSize);
    }
});

// 减小字体
elements.fontDecrease.addEventListener('click', () => {
    if (currentFontSize > minFontSize) {
        currentFontSize -= fontSizeStep;
        document.documentElement.style.setProperty('--font-size-base', `${currentFontSize}px`);
        localStorage.setItem('fontSize', currentFontSize);
    }
});
    
    // 切换主题
    elements.toggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        elements.toggleTheme.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
    
    // 日期选择
    elements.datePicker.addEventListener('click', () => {
        elements.dateInput.style.display = 'inline-block';
        elements.dateInput.focus();
    });
    
    elements.dateInput.addEventListener('change', () => {
        const selectedDate = new Date(elements.dateInput.value);
        if (!isNaN(selectedDate.getTime())) {
            currentDate = selectedDate;
            loadData();
            updateDateDisplay();
            renderSubjects();
            updateHomeworkStats();
            updateAttendance();
        }
        elements.dateInput.style.display = 'none';
    });
    
    // 全屏
    elements.fullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`全屏错误: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
    
    // 关闭模态框
    elements.closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            elements.addHomeworkModal.style.display = 'none';
            elements.attendanceModal.style.display = 'none';
            elements.dataModal.style.display = 'none';
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === elements.addHomeworkModal) {
            elements.addHomeworkModal.style.display = 'none';
        } else if (event.target === elements.attendanceModal) {
            elements.attendanceModal.style.display = 'none';
        } else if (event.target === elements.dataModal) {
            elements.dataModal.style.display = 'none';
        }
    });
    
    // 添加/编辑作业表单提交
    elements.addHomeworkForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const subjectId = elements.subjectInput.value;
        const homeworkId = elements.editHomeworkId.value;
        const title = elements.homeworkTitle.value;
        const description = elements.homeworkDescription.value;
        const dueDate = elements.homeworkDueDate.value;
        
        if (homeworkId) {
            // 编辑现有作业
            const homeworkIndex = homeworkData[subjectId].findIndex(hw => hw.id === homeworkId);
            if (homeworkIndex !== -1) {
                homeworkData[subjectId][homeworkIndex].title = title;
                homeworkData[subjectId][homeworkIndex].description = description;
                homeworkData[subjectId][homeworkIndex].dueDate = dueDate;
            }
        } else {
            // 添加新作业
            const newHomework = {
                id: Date.now().toString(),
                title,
                description,
                dueDate,
                completed: false
            };
            
            if (!homeworkData[subjectId]) {
                homeworkData[subjectId] = [];
            }
            
            homeworkData[subjectId].push(newHomework);
        }
        
        saveHomeworkData();
        renderSubjects();
        updateHomeworkStats();
        elements.addHomeworkModal.style.display = 'none';
    });
    
    // 管理出勤
    elements.manageAttendance.addEventListener('click', openAttendanceModal);
    
    // 导入学生名单
    elements.importStudents.addEventListener('click', importStudents);
    elements.importStudentsFile.addEventListener('change', handleImportStudentsFile);
    
    // 导出学生名单
    elements.exportStudents.addEventListener('click', exportStudents);
    
    // 下载学生名单模板
    elements.downloadTemplate.addEventListener('click', generateStudentTemplate);
    
    // 清空学生名单
    elements.clearStudents.addEventListener('click', clearStudents);
    
    // 数据管理
    elements.dataManagement.addEventListener('click', () => {
        elements.dataModal.style.display = 'block';
    });
    
    // 导出所有数据
    elements.exportData.addEventListener('click', exportAllData);
    
    // 导入所有数据
    elements.importData.addEventListener('click', importAllData);
    elements.importDataFile.addEventListener('change', handleImportDataFile);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);
