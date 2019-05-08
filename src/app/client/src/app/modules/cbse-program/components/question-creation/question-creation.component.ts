import { Component, OnInit, AfterViewChecked } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ActivatedRoute, Router } from '@angular/router';
import {  ConfigService, ResourceService, IUserData, IUserProfile, ToasterService  } from '@sunbird/shared';
import { PublicDataService, UserService, ActionService } from '@sunbird/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';


// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
@Component({
  selector: 'app-question-creation',
  templateUrl: './question-creation.component.html',
  styleUrls: ['./question-creation.component.css']
})
export class QuestionCreationComponent implements OnInit, AfterViewChecked  {
  public userProfile: IUserProfile;
  public publicDataService: PublicDataService;
  private toasterService: ToasterService;
  public resourceService: ResourceService;
  questionMetaForm: FormGroup;
  enableSubmitBtn = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private configService: ConfigService,
    publicDataService: PublicDataService,
    toasterService: ToasterService,
    resourceService: ResourceService,
    public actionService: ActionService
  ) {
    this.userService = userService;
    this.configService = configService;
    this.publicDataService = publicDataService;
    this.toasterService = toasterService;
    this.resourceService = resourceService;
  }
  answer_editor: any;
  question_editor: any;
  editor: any;
  myAssets = [];
  allImages = [];
  showImagePicker: boolean;
  showImageUploadModal: boolean;
  showErrorMsg: boolean;
  errorMsg: string;
  topicName: string;
  initializeImagePicker(editorType) {
    this.showImagePicker = true;
    this.editor = editorType === 'question' ? this.question_editor : this.answer_editor;
  }
  /**
   * function to hide image picker
   */
  dismissImagePicker() {
    this.showImagePicker = false;
  }

  /**
   * function to hide image upload modal
   */
  dismissImageUploadModal() {
    this.showImagePicker = true;
    this.showImageUploadModal = false;
  }

  /**
   * function to show image upload modal
   */
  initiateImageUploadModal() {
    this.showImagePicker = false;
    this.showImageUploadModal = true;
  }
  ngOnInit() {
    this.initializeFormFields();
    this.userService.userData$.subscribe(
      (user: IUserData) => {
        if (user && !user.err) {
          this.userProfile = user.userProfile;
        }
      });
    ClassicEditor.create( document.querySelector( '#question_editor' ), {
      toolbar: ['heading', '|', 'bold', '|', 'italic', '|',
        'bulletedList', '|', 'numberedList', '|', 'insertTable', '|'],
      image: {
          toolbar: ['imageTextAlternative', '|', 'imageStyle:full', 'imageStyle:alignRight'],
          styles: ['full', 'alignLeft', 'alignRight', 'side', 'alignCenter']
        },
      removePlugins: ['ImageCaption']
    } )
    .then( editor => {
      this.question_editor = editor;
      console.log( 'Editor was initialized', editor );
    } )
    .catch( error => {
        console.error( error.stack );
    } );

    ClassicEditor.create( document.querySelector( '#answer_editor' ), {
      toolbar: ['heading', '|', 'bold', '|', 'italic', '|',
        'bulletedList', '|', 'numberedList', '|', 'insertTable', '|'],
      image: {
          toolbar: ['imageTextAlternative', '|', 'imageStyle:full', 'imageStyle:alignRight'],
          styles: ['full', 'alignLeft', 'alignRight', 'side', 'alignCenter']
        },
      removePlugins: ['ImageCaption']
    } )
    .then( editor => {
      this.answer_editor = editor;
      console.log( 'Editor was initialized', editor );
    } )
    .catch( error => {
        console.error( error.stack );
    } );
  }
  initializeDropdown() {
    (<any>$('.ui.checkbox')).checkbox();
  }
  ngAfterViewChecked() {
    this.initializeDropdown();
  }

  initializeFormFields() {
    this.questionMetaForm = new FormGroup({
      learningOutcome: new FormControl('', Validators.required),
      qlevel : new FormControl('', [Validators.required]),
      bloomsLevel : new FormControl('', [Validators.required]),
      max_score: new FormControl(null, [Validators.required])
    });
  }
  enableSubmitButton() {
    this.questionMetaForm.valueChanges.subscribe(val => {
      this.enableSubmitBtn = (this.questionMetaForm.status === 'VALID');
    });
  }
  validateAllFormFields(questionMetaForm: FormGroup) {
  Object.keys(questionMetaForm.controls).forEach(field => {
    const control = questionMetaForm.get(field);
    if (control instanceof FormControl) {
      control.markAsDirty({ onlySelf: true });
    } else if (control instanceof FormGroup) {
      this.validateAllFormFields(control);
    }
  });
}
  createQuestion(event) {
    console.log(event);
    console.log(this.questionMetaForm.value);
    console.log(this.question_editor.getData());
    console.log(this.answer_editor.getData());
    if (this.questionMetaForm.valid) {
      const req = {
        url: this.configService.urlConFig.URLS.ASSESSMENT.CREATE,
        data: {
          'request': {
            'assessment_item': {
              'objectType': 'AssessmentItem',
              'metadata': {
                'createdBy': this.userProfile.userId,
                // 'creator': `${this.userProfile.firstName} ${this.userProfile.lastName ? this.userProfile.lastName : ''}`,
                'code': 'NA',
                'type': 'la',
                'category': 'LA',
                'itemType': 'UNIT',
                'version': 3,
                'name': 'la_NCFCOPY',
                'body': this.question_editor.getData(),
                'answers': [this.answer_editor.getData()],
                'learningOutcome': [this.questionMetaForm.value.learningOutcome],
                'bloomsLevel': [this.questionMetaForm.value.bloomsLevel],
                'qlevel': this.questionMetaForm.value.qlevel,
                'max_score': Number(this.questionMetaForm.value.max_score),
                // 'template': 'NA',
                'template_id': 'NA',
                // 'templateType': 'NA',
                'framework': 'NCFCOPY',
                'board': 'NCERT',
                'medium': 'English',
                'gradeLevel': [
                  'Kindergarten'
                ],
                'subject': 'English',
                'topic': ['Topic 1']
              }
            }
          }
        }
      };
      this.actionService.post(req).subscribe((res) => {
        console.log('res ', res);
      });
    } else {
      this.validateAllFormFields(this.questionMetaForm);
    }
  }
  /**
   * function to get images
   * @param offset page no
   */
  getMyImages(offset) {
    if (offset === 0) {
      this.myAssets.length = 0;
    }
    const req = {
      url: `${this.configService.urlConFig.URLS.COMPOSITE.SEARCH}`,
      data: {
        'request': {
          filters: {
            mediaType: ['image'],
            contentType: 'Asset',
            compatibilityLevel: {
              min: 1, max: 2
            },
            status: ['Live'],
            createdBy: this.userProfile.userId
          },
          limit: 50,
          offset: offset
        }
      }
    };
    this.publicDataService.post(req).subscribe((res) => {
      _.map(res.result.content, (item) => {
        if (item.downloadUrl) {
          this.myAssets.push(item);
        }
      });
    });
  }

  addImageInEditor(imageUrl) {
    this.editor.model.change(writer => {
      const imageElement = writer.createElement('image', {
        src: imageUrl
      });
      this.editor.model.insertContent(imageElement, this.editor.model.document.selection);
    });
    this.showImagePicker = false;
  }

  /**
   * functio to get all images
   * @param offset page no
   */
  getAllImages(offset) {
    if (offset === 0) {
      this.allImages.length = 0;
    }
    const req = {
      url: `${this.configService.urlConFig.URLS.COMPOSITE.SEARCH}`,
      data: {
        'request': {
          filters: {
            mediaType: ['image'],
            contentType: 'Asset',
            compatibilityLevel: {
              min: 1, max: 2
            },
            status: ['Live']
          },
          limit: 50,
          offset: offset
        }
      }
    };
    this.publicDataService.post(req).subscribe((res) => {
      _.map(res.result.content, (item) => {
        if (item.downloadUrl) {
          this.allImages.push(item);
        }
      });
    });
  }

  /**
   * function to lazy load my images
   */
  lazyloadMyImages() {
    const offset = this.myAssets.length;
    this.getMyImages(offset);
  }

  /**
   * function to lazy load all images
   */
  lazyloadAllImages() {
    const offset = this.allImages.length;
    this.getAllImages(offset);
  }

  /**
   * function to upload image
   */
  uploadImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const formData: FormData = new FormData();
    formData.append('file', file);
    const fileType = file.type;
    const fileName = file.name;
    const fileSize = file.size / 1024 / 1024;
    if (fileType.split('/')[0] === 'image') {
      this.showErrorMsg = false;
      if (fileSize > 1) {
        this.showErrorMsg = true;
        this.errorMsg = 'Max size allowed is 1MB';
      } else {
        this.errorMsg = '';
        this.showErrorMsg = false;
        reader.readAsDataURL(file);
      }
    } else {
      this.showErrorMsg = true;
      this.errorMsg = 'Please choose an image file';
    }
    if (!this.showErrorMsg) {
      // reader.onload = (uploadEvent: any) => {
      const req = {
        url: this.configService.urlConFig.URLS.CONTENT.CREATE_CONTENT,
        data: {
          'request': {
            content: {
              name: fileName,
              contentType: 'Asset',
              mediaType: 'image',
              mimeType: fileType,
              createdBy: this.userProfile.userId,
              language: ['English'],
              creator: `${this.userProfile.firstName} ${this.userProfile.lastName ? this.userProfile.lastName : ''}`,
              code: 'org.ekstep0.5375271337424472',
            }
          }
        }
      };
      this.publicDataService.post(req).subscribe((res) => {
        const imgId = res['result'].node_id;
        const request = {
          url: `${this.configService.urlConFig.URLS.CONTENT.UPLOAD_IMAGE}/${imgId}`,
          data: formData
        };
        this.publicDataService.post(request).subscribe((response) => {
          this.addImageInEditor(response.result.content_url);
          this.showImagePicker = false;
          this.showImageUploadModal = false;
        });
      });
      reader.onerror = (error: any) => {
      };
    }
  }

}