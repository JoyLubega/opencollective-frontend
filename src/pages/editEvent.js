import withData from '../lib/withData'
import withIntl from '../lib/withIntl';
import React from 'react'
import { addEventCollectiveData, addGetLoggedInUserFunction } from '../graphql/queries';
import ErrorPage from '../components/ErrorPage';
import EditEvent from '../components/EditEvent';

class EditEventPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  static getInitialProps ({ query: { parentCollectiveSlug, eventSlug } }) {
    return { parentCollectiveSlug, eventSlug }
  }

  async componentDidMount() {
    const { getLoggedInUser } = this.props;
    const LoggedInUser = getLoggedInUser && await getLoggedInUser();
    this.setState({ LoggedInUser, loading: false });
  }

  render() {
    const { data } = this.props;

    if (this.state.loading || !data.Collective) {
      return (<ErrorPage loading={this.state.loading} data={data} />)
    }

    const { LoggedInUser } = this.state;
    const event = data.Collective;

    return (
      <div>
        <EditEvent event={event} LoggedInUser={LoggedInUser} />
      </div>
    );
  }
}

export default withData(addGetLoggedInUserFunction(addEventCollectiveData(withIntl(EditEventPage))));
