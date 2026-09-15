(function () {
  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value == null ? '' : value;
    });
  }

  function apply(data) {
    setText('[data-personal="name"]', data.name);
    setText('[data-personal="greeting"]', data.greeting);
    setText('[data-personal="about"]', data.about);
    setText('[data-personal="personal_email"]', data.personal_email);
    setText('[data-personal="university_email"]', data.university_email);
    setText('[data-personal="location"]', data.location);
    setText('[data-personal="status"]', data.status);
  }

  if (typeof window.loadYaml !== 'function') {
    console.error('YAML loader is not available.');
    return;
  }

  window.loadYaml('./personal.yaml')
    .then(apply)
    .catch(function (error) {
      console.error('Personal information could not be loaded:', error);
    });
})();
