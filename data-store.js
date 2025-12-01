// data-store.js - سیستم ذخیره‌سازی مرکزی
console.log('✅ Data Store loaded!');

class DataStore {
    constructor() {
        this.loadData();
    }
    
    loadData() {
        this.persons = JSON.parse(localStorage.getItem('persons') || '[]');
        this.evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
        console.log(`📊 Loaded: ${this.persons.length} persons`);
    }
    
    saveData() {
        localStorage.setItem('persons', JSON.stringify(this.persons));
        localStorage.setItem('evaluations', JSON.stringify(this.evaluations));
    }
    
    addPerson(person) {
        const newPerson = {
            id: Date.now(),
            ...person,
            createdAt: new Date().toLocaleDateString('fa-IR')
        };
        this.persons.push(newPerson);
        this.saveData();
        return newPerson;
    }
    
    getPersons() {
        return this.persons;
    }
    
    getPersonByCode(code) {
        return this.persons.find(p => p.code === code);
    }
    
    deletePerson(code) {
        this.persons = this.persons.filter(p => p.code !== code);
        this.saveData();
    }
    
    exportData() {
        const data = {
            persons: this.persons,
            exportDate: new Date().toLocaleString('fa-IR')
        };
        return JSON.stringify(data, null, 2);
    }
}

window.appData = new DataStore();
