import fsStore from 'fs-store'
const FileStore = fsStore.FileStore

const userStore = new FileStore({
	filename: 'server-db/user.json',
	default_object: {},
	min_save_interval: 1000, // ms, default = 1000
	max_backups: 3, // default = 3
})

export default {
	user: userStore,
}

/*

var number_of_runs = store.get('number_of_runs', 0);
++number_of_runs;

// Store a value (will be written to disk asynchronously)
store.set('number_of_runs', number_of_runs);

console.log('This example has run ' + number_of_runs + ' time(s)');

*/

