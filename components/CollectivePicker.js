import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { groupBy, sortBy } from 'lodash';
import memoizeOne from 'memoize-one';
import { Flex } from '@rebass/grid';

import { CollectiveType } from '../lib/constants/collectives';
import StyledSelect from './StyledSelect';
import Avatar from './Avatar';
import { Span } from './Text';

const CollectiveTypesI18n = defineMessages({
  [CollectiveType.COLLECTIVE]: {
    id: 'collective.types.collective',
    defaultMessage: '{n, plural, one {collective} other {collectives}}',
  },
  [CollectiveType.ORGANIZATION]: {
    id: 'collective.types.organization',
    defaultMessage: '{n, plural, one {organization} other {organizations}}',
  },
  [CollectiveType.USER]: {
    id: 'collective.types.user',
    defaultMessage: '{n, plural, one {people} other {people}}',
  },
});

/** Default label builder used to render a collective */
const defaultLabelBuilder = collective => (
  <Flex alignItems="center">
    <Avatar collective={collective} radius={28} />
    <Span ml={2} fontSize="Caption" color="black.700">
      {collective.name}
    </Span>
    <Span ml={1} fontSize="Caption" color="black.500">
      ({collective.slug})
    </Span>
  </Flex>
);

/**
 * An overset og `StyledSelect` specialized to display, filter and pick a collective from a given list.
 * Accepts all the props from [StyledSelect](#!/StyledSelect).
 *
 * If you want the collectives to be automatically loaded from the API, check `CollectivePickerAsync`.
 */
class CollectivePicker extends React.PureComponent {
  /**
   * From a collectives list, returns a list of options that can be provided to a `StyledSelect`.
   *
   * @param {Array|null} collectives
   * @param {Boolean} groupByType
   * @param {function} sortFunc
   * @param {function} labelBuilder
   * @param {object} intl
   */
  getOptionsFromCollectives = memoizeOne((collectives, groupByType, sortFunc, labelBuilder, intl) => {
    if (!collectives || collectives.length === 0) {
      return [];
    }

    // Function to generate a single select option
    const buildCollectiveOption = collective => {
      return { value: collective.id, label: labelBuilder(collective) };
    };

    // If not grouped, just sort the collectives by names and return their options
    if (!groupByType) {
      return sortFunc(collectives).map(buildCollectiveOption);
    }

    // Group collectives under categories, sort the categories labels and the collectives inside them
    const collectivesByTypes = groupBy(collectives, 'type');
    const sortedActiveTypes = Object.keys(collectivesByTypes).sort();
    return sortedActiveTypes.map(type => {
      const sectionI18n = CollectiveTypesI18n[type];
      const sortedCollectives = sortFunc(collectivesByTypes[type]);
      const sectionLabel = sectionI18n ? intl.formatMessage(sectionI18n, { n: sortedCollectives.length }) : type;
      return {
        label: sectionLabel || '',
        options: sortedCollectives.map(buildCollectiveOption),
      };
    });
  });

  getAllOptions = memoizeOne((collectivesOptions, customOptions) => {
    return !customOptions || customOptions.length === 0
      ? collectivesOptions
      : [...customOptions, ...collectivesOptions];
  });

  render() {
    const {
      collectives,
      groupByType,
      labelBuilder,
      customOptions,
      getDefaultOption,
      intl,
      sortFunc,
      ...props
    } = this.props;

    const collectiveOptions = this.getOptionsFromCollectives(collectives, groupByType, sortFunc, labelBuilder, intl);
    const allOptions = this.getAllOptions(collectiveOptions, customOptions);
    return <StyledSelect options={allOptions} defaultValue={getDefaultOption(allOptions)} {...props} />;
  }
}

CollectivePicker.propTypes = {
  /** The list of collectives to display */
  collectives: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      type: PropTypes.string,
      name: PropTypes.string,
      slug: PropTypes.string,
      imageUrl: PropTypes.string,
    }),
  ),
  /** Custom options to be passed to styled select */
  customOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
    }),
  ),
  /** Function to sort collectives. Default to sorty by name */
  sortFunc: PropTypes.func,
  /** Get passed the options list, returns the default one */
  getDefaultOption: PropTypes.func.isRequired,
  /** Function to generate a label from the collective + index */
  labelBuilder: PropTypes.func.isRequired,
  /** Whether we should group collectives by type */
  groupByType: PropTypes.bool,
  /** @ignore from injectIntl */
  intl: PropTypes.object,
};

CollectivePicker.defaultProps = {
  groupByType: true,
  getDefaultOption: () => undefined,
  labelBuilder: defaultLabelBuilder,
  sortFunc: collectives => sortBy(collectives, 'name'),
};

export default injectIntl(CollectivePicker);
