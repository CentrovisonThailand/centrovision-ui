<template>
  <div class="top">
    <h1>
      Welcome to CentrovisioN App
    </h1>
    <b-alert v-model="showDismissibleAlert" variant="danger" dismissible>
      {{errorMessage}}
    </b-alert>
    <div class="browse-button">
      <b-form-file
        size="sm"
        multiple
        accept=".jpg, .png, .jpeg, .JPG, .PNG"
        v-model="selectedFiles"
        :state="Boolean(selectedFiles)"
        placeholder="Choose image files or drop it here..."
        drop-placeholder="Drop image files here..."
      ></b-form-file>
    </div>
    <div class="start-button">
      <b-button
        :variant="isUploading || isProcessing ? 'outline-secondary' : 'info'"
        @click="
          () => {
            modalSettingShow = true;
          }
        "
        >Setting</b-button
      >
      <b-button
        :variant="isUploading || isProcessing ? 'outline-secondary' : 'success'"
        @click="onUpload"
        >Start</b-button
      >
    </div>
    <div v-if="isUploading" class="loading">
      <hour-glass />
      <h3>Uploading ...</h3>
    </div>

    <div v-if="isProcessing" class="loading">
      <hour-glass />
      <h3>Processing ...</h3>
    </div>
    <div
      v-if="!isUploading && !isProcessing && output.length"
      class="result-table"
    >
      <b-table-simple hover small caption-top responsive>
        <caption>
          Detected Results:
        </caption>
        <colgroup>
          <col />
          <col />
        </colgroup>
        <colgroup>
          <col />
          <col />
          <col />
        </colgroup>
        <colgroup>
          <col />
          <col />
        </colgroup>
        <b-thead head-variant="dark">
          <b-tr>
            <b-th colspan="2">Image name</b-th>
            <b-th colspan="3">Total detected</b-th>
            <b-th colspan="2">Detected</b-th>
          </b-tr>
          <b-tr>
            <b-th></b-th>
            <b-th></b-th>
            <b-th></b-th>
            <b-th></b-th>
            <b-th></b-th>
            <b-th>Detected class</b-th>
            <b-th>ROIs</b-th>
          </b-tr>
        </b-thead>
        <b-tbody v-for="item in output" :key="item.id">
          <b-tr>
            <b-th
              :rowspan="item.total_detected + 1"
              @click="imageView(item.image_name)"
              >{{ item.image_name }}</b-th
            >
            <b-th :rowspan="item.total_detected + 1"></b-th>
            <b-th :rowspan="item.total_detected + 1"></b-th>
            <b-th :rowspan="item.total_detected + 1">{{
              item.total_detected
            }}</b-th>
            <b-th :rowspan="item.total_detected + 1"></b-th>
          </b-tr>
          <b-tr v-for="detail in item.detected" :key="detail.id">
            <b-td>{{ detail.class_name }}</b-td>
            <b-td>{{ detail.rois }}</b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </div>
    <b-modal v-model="modalShow" size="xl" :title="imageName">
      <center>
        <circle-10 v-if="isImageLaoding"/>
        <b-img v-if="showImage && !isImageLaoding" :src="imagePath"></b-img>
      </center>
      <template #modal-footer>
        <div class="w-100">
          <b-button
            variant="success"
            size="sm"
            class="float-left"
            @click="downloadImage(imageName)"
          >
            Download
          </b-button>
          <b-button
            variant="primary"
            size="sm"
            class="float-right"
            @click="modalShow = false"
          >
            Close
          </b-button>
        </div>
      </template>
    </b-modal>
    <b-modal v-model="modalSettingShow" title="API Endpoint Configuration">
      <b-form-group>
        <b-form-radio-group>
          <b-form-radio
            @change="
              () => {
                apiEndpoint = 'http://localhost:8000';
                remoteCheck = false;
              }
            "
            >Localhost</b-form-radio
          >
          <b-form-radio
            @change="
              () => {
                remoteCheck = true;
              }
            "
            >Remote</b-form-radio
          >
        </b-form-radio-group>
        <div class="api-input" style="margin-top: 10px;">
          <b-form-input
            v-if="remoteCheck"
            v-model="apiEndpoint"
            placeholder="https://your-api-endpoint.com"
          ></b-form-input>
        </div>
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import { HourGlass, Circle10 } from "vue-loading-spinner";
import {
  BButton,
  BFormFile,
  BAlert,
  BImg,
  BModal,
  BFormGroup,
  BFormRadio,
  BFormRadioGroup,
  BFormInput,
  BTableSimple,
  BThead,
  BTbody,
  BTr,
  BTd,
  BTh,
} from "bootstrap-vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

export default {
  name: "InputForm",
  components: {
    HourGlass,
    Circle10,
    BButton,
    BFormFile,
    BAlert,
    BImg,
    BModal,
    BFormGroup,
    BFormRadio,
    BFormRadioGroup,
    BFormInput,
    BTableSimple,
    BThead,
    BTbody,
    BTr,
    BTd,
    BTh,
  },
  data() {
    return {
      selectedFiles: [],
      output: [],
      isUploading: false,
      isProcessing: false,
      showImage: false,
      showDismissibleAlert: false,
      imagePath: null,
      modalShow: false,
      imageName: null,
      modalSettingShow: false,
      apiEndpoint: localStorage.getItem('api-endpoint'),
      remoteCheck: true,
      errorMessage: null,
      isImageLaoding: false,
    };
  },

  methods: {
    onFileSelected(event) {
      this.selectedFiles = event.target.files[0];
    },
    onUpload() {
      localStorage.setItem('api-endpoint', this.apiEndpoint)
      if (this.selectedFiles.length === 0) {
        this.showDismissibleAlert = true;
        this.errorMessage = "Plese choose image files before start !!"
        return;
      }
      const config = {
        onUploadProgress: (progressEvent) => {
          var percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (percentCompleted === 100) {
            this.isUploading = false;
            this.isProcessing = true;
          }
        },
      };
      const fd = new FormData();
      this.selectedFiles.forEach((file) => {
        fd.append("listFiles", file);
      });
      this.isUploading = true;
      axios
        .post(`${this.apiEndpoint}/image`, fd, config)
        .then(({ data }) => {
          this.output = data.output;
          this.isProcessing = false;
        })
        .catch((err) => {
          if (err.response) {
            this.showDismissibleAlert = true;
            this.errorMessage = "Invalid: API Not Found (404)"
            this.isUploading = false;
            this.isProcessing = false;
          }
        });
    },
    imageView(image_name) {
      this.imageName = image_name;
      this.modalShow = true;
      this.showImage = true;
      this.isImageLaoding = true;
      axios
        .get(`${this.apiEndpoint}/get-image`, {
          params: { img_name: image_name },
        })
        .then(({ data }) => {
          this.imagePath = `data:image/jpeg;base64, ${data.image}`;
          this.isImageLaoding = false;
        });
    },
    downloadImage(image_name) {
      console.log(image_name);
      axios
        .get(`${this.apiEndpoint}/download/image`, {
          params: { img_name: image_name },
          responseType: "blob",
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", image_name); //or any other extension
          document.body.appendChild(link);
          link.click();
        })
        .catch(console.error);
    },
  },
};
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 50px auto;
}
.result-table {
  margin: 50px auto;
  max-width: 700px;
}
.browse-button {
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto;
}
.start-button {
  max-width: 200px;
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 30px auto;
}
.custom-file{
  text-align: left;
}
</style>
