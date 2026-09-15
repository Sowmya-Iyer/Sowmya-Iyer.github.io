(function () {
  function createSkill(skill, delay) {
    var col = document.createElement('div');
    col.className = 'col-6 col-sm-4 col-md-3 text-center';
    col.setAttribute('data-aos', 'fade-up');
    col.setAttribute('data-aos-delay', String(delay));

    if (skill.icon) {
      var icon = document.createElement('i');
      icon.className = skill.icon;
      col.appendChild(icon);
    }

    var name = document.createElement('div');
    name.className = 'h6';
    name.textContent = skill.name || '';
    col.appendChild(name);
    return col;
  }

  function renderSkills(data) {
    var root = document.getElementById('skills-content');
    if (!root || !data || !Array.isArray(data.skills)) return;

    root.innerHTML = '';
    var row = document.createElement('div');
    row.className = 'row';

    data.skills.forEach(function (category, categoryIndex) {
      var section = document.createElement('div');
      section.className = categoryIndex % 2 === 0 ? 'col-md-5' : 'col-md-5 offset-md-2';

      var heading = document.createElement('div');
      heading.className = 'h5';
      heading.textContent = category.category || '';
      section.appendChild(heading);

      var skillsRow = document.createElement('div');
      skillsRow.className = 'row py-1';

      (category.skills || []).forEach(function (skill, index) {
        skillsRow.appendChild(createSkill(skill, 100 + (index * 25)));
      });

      section.appendChild(skillsRow);
      row.appendChild(section);
    });

    root.appendChild(row);
  }

  if (typeof window.loadYaml !== 'function') {
    console.error('YAML loader is not available.');
    return;
  }

  window.loadYaml('./skills.yaml')
    .then(function (data) {
      renderSkills(data);
      if (window.AOS && typeof window.AOS.refresh === 'function') {
        window.AOS.refresh();
      }
    })
    .catch(function (error) {
      console.error('Skills could not be loaded:', error);
    });
})();
