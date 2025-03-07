<?php

/**
 * @file controllers/grid/subscriptions/SubscriptionsGridRow.php
 *
 * Copyright (c) 2014-2021 Simon Fraser University
 * Copyright (c) 2000-2021 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class SubscriptionsGridRow
 *
 * @ingroup controllers_grid_subscriptions
 *
 * @brief Subscriptions grid row definition
 */

namespace APP\controllers\grid\subscriptions;

use APP\subscription\IndividualSubscription;
use APP\subscription\InstitutionalSubscription;
use PKP\controllers\grid\GridRow;
use PKP\linkAction\LinkAction;
use PKP\linkAction\request\AjaxModal;
use PKP\linkAction\request\RemoteActionConfirmationModal;

class SubscriptionsGridRow extends GridRow
{
    //
    // Overridden methods from GridRow
    //
    /**
     * @copydoc GridRow::initialize()
     *
     * @param null|mixed $template
     */
    public function initialize($request, $template = null)
    {
        parent::initialize($request, $template);

        // Is this a new row or an existing row?
        $element = & $this->getData();
        assert($element instanceof IndividualSubscription || $element instanceof InstitutionalSubscription);

        $rowId = $this->getId();

        if (!empty($rowId) && is_numeric($rowId)) {
            // Only add row actions if this is an existing row
            $router = $request->getRouter();
            $actionArgs = [
                'gridId' => $this->getGridId(),
                'rowId' => $rowId
            ];

            $actionArgs = array_merge($actionArgs, $this->getRequestArgs());

            $this->addAction(new LinkAction(
                'edit',
                new AjaxModal(
                    $router->url($request, null, null, 'editSubscription', null, $actionArgs),
                    __('manager.subscriptions.edit'),
                    null,
                    true
                ),
                __('common.edit'),
                'edit'
            ));
            if (!$element->isNonExpiring()) {
                $this->addAction(new LinkAction(
                    'renew',
                    new RemoteActionConfirmationModal(
                        $request->getSession(),
                        __('manager.subscriptions.confirmRenew'),
                        __('manager.subscriptions.renew'),
                        $router->url(
                            $request,
                            null,
                            null,
                            'renewSubscription',
                            null,
                            array_merge($actionArgs, [
                                'institutional' => $element instanceof InstitutionalSubscription ? 1 : 0
                            ])
                        ),
                        'primary'
                    ),
                    __('manager.subscriptions.renew'),
                    'renew'
                ));
            }
            $this->addAction(new LinkAction(
                'delete',
                new RemoteActionConfirmationModal(
                    $request->getSession(),
                    __('subscriptionManager.subscription.confirmRemove'),
                    __('common.delete'),
                    $router->url($request, null, null, 'deleteSubscription', null, $actionArgs),
                    'negative'
                ),
                __('grid.action.delete'),
                'delete'
            ));
        }
    }
}
