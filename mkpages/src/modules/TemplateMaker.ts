import fs = require('fs');
import path = require('path');

/**
 * Class TemplateMaker
 * 
 * Reads templates from a template_dir, the uses the build_template() to replace key,value
 * pairs and write the resulting file to the file_dir/new_filename.
 * 
 * @param string template_dir Template_dir The input directory of templates
 * @param string file_dir The output directory of templates
 * @param string doc_root the full or relative path to the
 */
export class TemplateMaker {

	private doc_root;
	private contents;

	constructor(private template_dir, private file_dir, private dest_dir, doc_root) {
		this.doc_root = (typeof doc_root === 'undefined') ? './' : doc_root;
		this.contents = '';

		// create the destination directory
		this.mkdirParent(this.doc_root + this.dest_dir, (err) => {
			if(err) {

			}
		});
	}

	/**
	 * Opens a template and replaces key values pairs in a template to create an output file
	 * 
	 * @param string src_filename The file name of the template
	 * @param string new_filename The final file (the output file)
	 * @param array<{key:'', value:''}> Values in the template that need to be replaced
	 */
	build_template( src_filename, new_filename, pairs ) {
		const template_file = this.doc_root + this.template_dir + '/' + src_filename;
		const new_file      = this.doc_root + this.dest_dir + '/' + this.file_dir     + '/' + new_filename;

		fs.access(template_file, fs.constants.R_OK, (err) => {
			if (err) {
				console.error(err.message);
			}

			fs.readFile(template_file, 'utf8', (err, content) => {

				if(err) {
					console.log(err.message);
				} else {
					pairs.forEach(element => {
						content = content.replace(new RegExp(element.key, 'g'), element.value);
					});

					const new_directory = this.doc_root + this.dest_dir + '/' + this.file_dir;

					this.mkdirParent(new_directory, (err) => {

						if(err) {
							// I don't care if the directory already exists, it's what I want	
						}

						this.writeFile(new_file, content);

					});					
				}
			});
		});		
	}

	/**
	 * Save our new content into a new file.
	 * 
	 * @param new_file The full file path
	 * @param content The new content
	 */
	writeFile(new_file, content) {

		console.log('Writing to ' + new_file);

		fs.writeFile(new_file, content, 'utf8', (err) => {
			if (err) return console.log(err);
		});
	}

	/**
	 * Make a directory and any parent directories.
	 * 
	 * @param dirPath The path you want to make
	 * @param callback The function to call when done
	 */
	mkdirParent(dirPath, callback) {
		//Call the standard fs.mkdir
		fs.mkdir(dirPath, (error) => {
			//When it fail in this way, do the custom steps
			if (error && error.errno === 34) {
				//Create all the parents recursively
				this.mkdirParent(path.dirname(dirPath), callback);
				//And then the directory
				this.mkdirParent(dirPath, callback);
			}
			//Manually run the callback since we used our own callback to do all these
			callback && callback(error);
		});
	};
}