/**
 * @file cypress/tests/integration/Orcid.cy.js
 *
 * Copyright (c) 2014-2024 Simon Fraser University
 * Copyright (c) 2000-2024 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 */

function openTemplate(mailableName, templateName) {
	// Select the mailable
	cy.contains('li.listPanel__item', mailableName)
		.find('button')
		.contains('Edit')
		.click();


	// Select the template
	cy.contains('.listPanel', 'Templates')
		.find('li.listPanel__item')
		.contains(templateName)
		.parents('li.listPanel__item')
		.find('button')
		.contains('Edit')
		.click();
}


function populateEmailTemplateBody(){
	cy.get('#editEmailTemplate-body-control-en_ifr')
	.its('0.contentDocument.body')
	.should('not.be.empty')
	.then((body) => {
		cy.wrap(body).clear().type('Test template body'); // Clear and type into the iframe body
	});
}

function setUnrestrictedTo(value) {
	cy.get('input[name="isUnrestricted"]')[value ? 'check' : 'uncheck']({ force: true }); // Uncheck the checkbox
}

describe('Email Template Access Tests', function () {
	it('Checks that user cannot access restricted template not assigned to their group', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');

		openTemplate('Discussion (Copyediting)', 'Discussion (Copyediting)');
		//  Remove all existing access
		setUnrestrictedTo(false)
		cy.get('input[name="assignedUserGroupIds"]')
			.as('checkboxes')
			.uncheck({ force: true })

		cy.contains('button', 'Save').click();
		cy.logout();

		// 	Login as user without access - copyedit
		cy.login('svogt')
		cy.visit(
			'index.php/publicknowledge/en/dashboard/editorial?currentViewId=assigned-to-me'
		);
		cy.contains('button', 'View').first().click();
		cy.contains('a', 'Copyediting').click();
		cy.contains('a', 'Add discussion').click();

		cy.get('select#template').find('option').contains('Discussion (Copyediting)').should('not.exist');
	})

	it('Checks that user can access unrestricted template not specifically assigned to their group', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');

		openTemplate('Discussion (Copyediting)', 'Discussion (Copyediting)');
		setUnrestrictedTo(true);

		cy.get('input[name="assignedUserGroupIds"]')
			.as('checkboxes')
			.uncheck({ force: true })

		cy.contains('button', 'Save').click();
		cy.logout();

		// 	Login as user with access - copyedit
		cy.login('svogt')
		cy.visit(
			'index.php/publicknowledge/en/dashboard/editorial?currentViewId=assigned-to-me'
		);
		cy.contains('button', 'View').first().click();
		cy.contains('a', 'Copyediting').click();
		cy.contains('a', 'Add discussion').click();

		cy.get('select#template').find('option').contains('Discussion (Copyediting)').should('to.exist');
	})

	it('Checks that user can access template assigned to their group', () => {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/manageEmails');

		openTemplate('Discussion (Copyediting)', 'Discussion (Copyediting)');
		setUnrestrictedTo(false)
		cy.contains('label', 'Copyeditor').find('input[type="checkbox"]').check({ force: true });
		cy.contains('button', 'Save').click();
		cy.logout();

		// 	Login as user with access - copyedit
		cy.login('svogt')
		cy.visit(
			'index.php/publicknowledge/en/dashboard/editorial?currentViewId=assigned-to-me'
		);
		cy.contains('button', 'View').first().click();
		cy.contains('a', 'Copyediting').click();
		cy.contains('a', 'Add discussion').click();

		cy.get('select#template').find('option').contains('Discussion (Copyediting)').should('to.exist');
	})
});
