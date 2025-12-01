// data-store.js - سیستم مدیریت مرکزی داده‌ها
// این فایل داده‌های همه صفحات رو مدیریت می‌کنه

console.log('✅ Data Store loaded successfully!');

// کلاس مدیریت داده‌ها
class DataStore {
    constructor() {
        this.persons = [];
        this.evaluations = [];
        this.settings = {};
        this.loadAllData();
        console.log('📊 Data Store initialized');
    }
    
    // بارگذاری همه داده‌ها از localStorage
    loadAllData() {
        try {
            // بارگذاری اشخاص
            const savedPersons = localStorage.getItem('persons');
            this.persons = savedPersons ? JSON.parse(savedPersons) : [];
            
            // بارگذاری ارزیابی‌ها
            const savedEvaluations = localStorage.getItem('evaluations');
            this.evaluations = savedEvaluations ? JSON.parse(savedEvaluations) : [];
            
            // بارگذاری تنظیمات
            const savedSettings = localStorage.getItem('app_settings');
            this.settings = savedSettings ? JSON.parse(savedSettings) : {
                appName: 'سیستم ارزیابی مقالات',
                version: '1.0.0',
                lastBackup: null
            };
            
            console.log(`📂 داده‌ها بارگیری شد: ${this.persons.length} شخص، ${this.evaluations.length} ارزیابی`);
            
        } catch (error) {
            console.error('❌ خطا در بارگیری داده‌ها:', error);
            this.resetData();
        }
    }
    
    // ذخیره همه داده‌ها
    saveAllData() {
        try {
            localStorage.setItem('persons', JSON.stringify(this.persons));
            localStorage.setItem('evaluations', JSON.stringify(this.evaluations));
            localStorage.setItem('app_settings', JSON.stringify(this.settings));
            console.log('💾 همه داده‌ها ذخیره شدند');
        } catch (error) {
            console.error('❌ خطا در ذخیره داده‌ها:', error);
        }
    }
    
    // بازنشانی داده‌ها در صورت خطا
    resetData() {
        this.persons = [];
        this.evaluations = [];
        this.settings = {
            appName: 'سیستم ارزیابی مقالات',
            version: '1.0.0',
            lastBackup: null
        };
        this.saveAllData();
        console.log('🔄 داده‌ها بازنشانی شدند');
    }
    
    // ========== مدیریت اشخاص ==========
    
    // اضافه کردن شخص جدید
    addPerson(personData) {
        const newPerson = {
            id: Date.now(),
            ...personData,
            createdAt: new Date().toISOString(),
            registerDate: new Date().toLocaleDateString('fa-IR'),
            isActive: true
        };
        
        this.persons.push(newPerson);
        this.saveAllData();
        console.log(`👤 شخص جدید اضافه شد: ${newPerson.firstName} ${newPerson.lastName}`);
        return newPerson;
    }
    
    // دریافت همه اشخاص
    getAllPersons() {
        return this.persons;
    }
    
    // دریافت اشخاص فعال
    getActivePersons() {
        return this.persons.filter(p => p.isActive);
    }
    
    // پیدا کردن شخص با کد
    getPersonByCode(personCode) {
        return this.persons.find(p => p.code === personCode);
    }
    
    // جستجوی اشخاص با نام
    searchPersons(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.persons.filter(p => 
            p.firstName.toLowerCase().includes(term) ||
            p.lastName.toLowerCase().includes(term) ||
            p.code.includes(term) ||
            p.position.toLowerCase().includes(term)
        );
    }
    
    // ویرایش شخص
    updatePerson(personCode, updatedData) {
        const index = this.persons.findIndex(p => p.code === personCode);
        if (index !== -1) {
            this.persons[index] = {
                ...this.persons[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveAllData();
            console.log(`✏️ شخص با کد ${personCode} ویرایش شد`);
            return true;
        }
        return false;
    }
    
    // حذف شخص
    deletePerson(personCode) {
        const initialLength = this.persons.length;
        this.persons = this.persons.filter(p => p.code !== personCode);
        
        if (this.persons.length < initialLength) {
            this.saveAllData();
            console.log(`🗑️ شخص با کد ${personCode} حذف شد`);
            return true;
        }
        return false;
    }
    
    // غیرفعال کردن شخص
    deactivatePerson(personCode) {
        const person = this.getPersonByCode(personCode);
        if (person) {
            person.isActive = false;
            person.deactivatedAt = new Date().toISOString();
            this.saveAllData();
            console.log(`⏸️ شخص با کد ${personCode} غیرفعال شد`);
            return true;
        }
        return false;
    }
    
    // ========== export/import ==========
    
    // export همه داده‌ها به JSON
    exportAllData() {
        const exportData = {
            exportInfo: {
                date: new Date().toISOString(),
                app: this.settings.appName,
                version: this.settings.version,
                records: {
                    persons: this.persons.length,
                    evaluations: this.evaluations.length
                }
            },
            persons: this.persons,
            evaluations: this.evaluations,
            settings: this.settings
        };
        
        this.settings.lastBackup = new Date().toISOString();
        this.saveAllData();
        
        console.log('📤 همه داده‌ها برای export آماده شدند');
        return exportData;
    }
    
    // export به فایل JSON
    exportToFile() {
        const data = this.exportAllData();
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        return true;
    }
    
    // import از فایل JSON
    importFromFile(jsonData) {
        try {
            if (jsonData.persons) this.persons = jsonData.persons;
            if (jsonData.evaluations) this.evaluations = jsonData.evaluations;
            if (jsonData.settings) this.settings = jsonData.settings;
            
            this.saveAllData();
            console.log('📥 داده‌ها با موفقیت import شدند');
            return true;
        } catch (error) {
            console.error('❌ خطا در import:', error);
            return false;
        }
    }
    
    // ========== آمار و گزارش ==========
    
    // آمار کلی
    getStats() {
        return {
            totalPersons: this.persons.length,
            activePersons: this.getActivePersons().length,
            internalPersons: this.persons.filter(p => p.type === 'internal').length,
            externalPersons: this.persons.filter(p => p.type === 'external').length,
            totalEvaluations: this.evaluations.length,
            lastBackup: this.settings.lastBackup
        };
    }
    
    // نمایش آمار در Console
    showStats() {
        const stats = this.getStats();
        console.log('📈 آمار سیستم:');
        console.log(`• کل اشخاص: ${stats.totalPersons}`);
        console.log(`• اشخاص فعال: ${stats.activePersons}`);
        console.log(`• داخلی: ${stats.internalPersons} | خارجی: ${stats.externalPersons}`);
        console.log(`• کل ارزیابی‌ها: ${stats.totalEvaluations}`);
        console.log(`• آخرین Backup: ${stats.lastBackup ? new Date(stats.lastBackup).toLocaleString('fa-IR') : 'ندارد'}`);
    }
}

// ایجاد instance جهانی
window.appData = new DataStore();

// همچنین برخی توابع global برای دسترسی آسان
window.getPersonByCode = (code) => window.appData.getPersonByCode(code);
window.getAllPersons = () => window.appData.getAllPersons();
window.searchPersons = (term) => window.appData.searchPersons(term);
window.exportData = () => window.appData.exportToFile();
window.showStats = () => window.appData.showStats();

console.log('🚀 Data Store آماده استفاده است!');
