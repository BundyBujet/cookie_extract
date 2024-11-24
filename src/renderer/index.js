const delay = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

document.addEventListener("alpine:init", () => {
  Alpine.data("loginForm", () => ({
    email: "test@gmail.com",
    password: "123456",
    emailError: "",
    passwordError: "",
    formSuccess: "",
    loginSuccess: false,
    isDisabled: false,

    validateEmail() {
      this.emailError = "";
      const emailPattern = /^[^@]+@\w+(\.\w+)+\w$/;
      if (!this.email) {
        this.emailError = "Email is required.";
      } else if (!emailPattern.test(this.email)) {
        this.emailError = "Please enter a valid email address.";
      }
    },

    validatePassword() {
      this.passwordError = "";
      if (!this.password) {
        this.passwordError = "Password is required.";
      } else if (this.password.length < 6) {
        this.passwordError = "Password must be at least 6 characters.";
      }
    },

    validateForm(e) {
      this.isDisabled = true;
      this.validateEmail();
      this.validatePassword();
      if (!this.emailError && !this.passwordError) {
        window.electronAPI.sendCredentials({
          email: this.email,
          password: this.password,
        });

        window.electronAPI.onCredentialsSent((event, data) => {
          if (data.success) {
            this.formSuccess = "Successfully logged in.";
            this.loginSuccess = true;
            window.location.href = "req-page.html";
          } else {
            this.formSuccess = "Invalid credentials.";
            this.loginSuccess = false;
          }
        });
      }
    },
  }));
  //======================================

  Alpine.data("requirementsCheck", () => ({
    checkRequirementsMessage: "",
    checkRequirementsSuccess: false,
    checkRequirements() {
      window.electronAPI.sendRequirementsCheck();
      window.electronAPI.onRequirementsCheckResult(async (event, data) => {
        console.log("Data:", data);
        if (data.success) {
          this.checkRequirementsSuccess = true;
          this.checkRequirementsMessage =
            "Requirements are installed, You can proceed.";
          await delay(2);
          window.location.href = "index.html";
        } else {
          this.checkRequirementsSuccess = false;
          this.checkRequirementsMessage = "Please install requirements.";
        }
      });
    },
  }));
  //======================================
  Alpine.data("selectCSVFile", () => ({
    process: "",
    filePath: "",
    processError: "",
    filePathError: "",
    formSuccess: "",
    loginSuccess: false,
    fileName: "",
    isDisabled: false,
    selectFile() {
      window.electronAPI.openFileDialog();
      window.electronAPI.fileSelected((event, data) => {
        console.log("Data:", data);
        this.filePath = data?.path;
        this.fileName = data?.fileName;
      });
    },
    validateProcess() {
      this.processError = "";
      if (!this.process) {
        this.processError = "Process is required.";
      } else if (this.process > 6 && !this.process) {
        this.processError = "Please enter a valid process number.";
      }
    },

    validateFilePath() {
      this.filePathError = "";
      if (!this.filePath) {
        this.filePathError = "filePath is required.";
      } else if (this.filePath.length < 6) {
        this.filePathError = "filePath must be at least 6 characters.";
      }
    },
    selectCSVFileForm() {
      this.validateProcess();
      this.validateFilePath();
      if (!this.processError && !this.filePathError) {
        this.isDisabled = true;
        window.electronAPI.sendProcessInfo({
          filePath: this.filePath,
          process: this.process,
        });
      }
    },
  }));
});
