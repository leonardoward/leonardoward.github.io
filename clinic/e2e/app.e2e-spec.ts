import { ClinicPage } from './app.po';

describe('clinic App', function() {
  let page: ClinicPage;

  beforeEach(() => {
    page = new ClinicPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('cl works!');
  });
});
