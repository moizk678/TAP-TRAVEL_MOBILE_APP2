import {showMessage} from "react-native-flash-message";

const showError = (message) => {
    showMessage({
        type: 'danger',
        icon: 'danger',
        message
    })
}

const showSuccess = (message) => {
    showMessage({
        type: 'success',
        icon: 'success',
        message
    })
}

export {
    showError, 
    showSuccess
}
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Get day, month, and year
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    // Handle the day suffix (st, nd, rd, th)
    const suffix = (day) => {
      if (day > 3 && day < 21) return 'th'; // Handle 4-20th
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    return `${day}${suffix(day)} ${month} ${year}`;
  };

  export const format12time = (time24) => {
    // Split the input time into hours and minutes
    const [hours, minutes] = time24.split(":");
  
    // Determine AM or PM
    const period = hours >= 12 ? "PM" : "AM";
  
    // Convert the hour from 24-hour format to 12-hour format
    let hours12 = hours % 12;
    if (hours12 === 0) hours12 = 12; // Handle midnight (00:xx -> 12:xx AM)
  
    // Return the formatted time in 12-hour format
    return `${hours12}:${minutes} ${period}`;
  };

  export const pakistanCities = {

    "Abbottabad": {
        "name": "Abbottabad",
        "province": "Khyber Pakhtunkhwa",
        "busStops": [
            { "name": "General Bus Stand" },
            { "name": "Mansehra Road Bus Stop" },
            { "name": "Ayub Medical Complex Bus Stop" },
            { "name": "Supply Bazaar Bus Stop" },
            { "name": "Fawara Chowk Bus Stop" }
        ]
    },
    "Ahmedpur East": {
        "name": "Ahmedpur East",
        "province": "Punjab",
        "busStops": [
            { "name": "Ahmedpur East Bus Terminal" },
            { "name": "Chowk Abbasia Bus Stop" },
            { "name": "Railway Station Bus Stop" },
            { "name": "City Chowk Bus Stop" },
            { "name": "Hospital Road Bus Stop" }
        ]
    },
    "Attock": {
        "name": "Attock",
        "province": "Punjab",
        "busStops": [
            { "name": "Attock City Bus Terminal" },
            { "name": "Kamra Road Bus Stop" },
            { "name": "Fawara Chowk Bus Stop" },
            { "name": "Dar-ul-Islam Colony Bus Stop" },
            { "name": "Hazro Adda Bus Stop" }
        ]
    },
    "Bahawalpur": {
        "name": "Bahawalpur",
        "province": "Punjab",
        "busStops": [
            { "name": "General Bus Stand" },
            { "name": "Yazman Road Bus Stop" },
            { "name": "Model Town C Bus Stop" },
            { "name": "Farid Gate Bus Stop" },
            { "name": "University Chowk Bus Stop" }
        ]
    },
    "Bannu": {
        "name": "Bannu",
        "province": "Khyber Pakhtunkhwa",
        "busStops": [
            { "name": "Bannu General Bus Stand" },
            { "name": "Mandew Road Bus Stop" },
            { "name": "Township Bus Stop" },
            { "name": "Lakki Gate Bus Stop" },
            { "name": "Domel Adda Bus Stop" }
        ]
    },
    "Batkhela": {
        "name": "Batkhela",
        "province": "Khyber Pakhtunkhwa",
        "busStops": [
            { "name": "Batkhela Bus Terminal" },
            { "name": "Sakhakot Adda Bus Stop" },
            { "name": "Thana Bazaar Bus Stop" },
            { "name": "Pul Chowki Bus Stop" },
            { "name": "Khar Adda Bus Stop" }
        ]
    },
    "Bhakkar": {
        "name": "Bhakkar",
        "province": "Punjab",
        "busStops": [
            { "name": "Bhakkar General Bus Stand" },
            { "name": "Darya Khan Adda Bus Stop" },
            { "name": "Mandi Town Bus Stop" },
            { "name": "Jhang Road Bus Stop" },
            { "name": "Kalur Kot Adda Bus Stop" }
        ]
    },
    "Chiniot": {
        "name": "Chiniot",
        "province": "Punjab",
        "busStops": [
            { "name": "Chiniot Bus Terminal" },
            { "name": "Tehsil Chowk Bus Stop" },
            { "name": "Chenab Nagar Bus Stop" },
            { "name": "Lalian Adda Bus Stop" },
            { "name": "Bhowana Adda Bus Stop" }
        ]
    },
    "Chakwal": {
        "name": "Chakwal",
        "province": "Punjab",
        "busStops": [
            { "name": "Chakwal General Bus Stand" },
            { "name": "Talagang Adda Bus Stop" },
            { "name": "Balkassar Bus Stop" },
            { "name": "Kallar Kahar Bus Stop" },
            { "name": "Dheedwal Bus Stop" }
        ]
    },
    "Chaman": {
        "name": "Chaman",
        "province": "Balochistan",
        "busStops": [
            { "name": "Chaman Bus Terminal" },
            { "name": "Mall Road Bus Stop" },
            { "name": "Railway Station Bus Stop" },
            { "name": "Killi Luqman Bus Stop" },
            { "name": "Killi Faizo Bus Stop" }
        ]
    },
    "Dera Ghazi Khan": {
        "name": "Dera Ghazi Khan",
        "province": "Punjab",
        "busStops": [
            { "name": "DG Khan Bus Terminal" },
            { "name": "Pul Dat Bus Stop" },
            { "name": "Chowk Churhatta Bus Stop" },
            { "name": "College Road Bus Stop" },
            { "name": "Sakhi Sarwar Adda Bus Stop" }
        ]
    },
    "Dera Ismail Khan": {
        "name": "Dera Ismail Khan",
        "province": "Khyber Pakhtunkhwa",
        "busStops": [
            { "name": "DI Khan General Bus Stand" },
            { "name": "Topanwala Chowk Bus Stop" },
            { "name": "Commissionary Bazaar Bus Stop" },
            { "name": "Gomal University Bus Stop" },
            { "name": "Tank Adda Bus Stop" }
        ]
    },
    "Faisalabad": {
        "name": "Faisalabad",
        "province": "Punjab",
        "busStops": [
            { "name": "General Bus Stand" },
            { "name": "Samundri Road Bus Stop" },
            { "name": "Jhang Road Bus Stop" },
            { "name": "Sargodha Road Bus Stop" },
            { "name": "D Ground Bus Stop" }
        ]
    },
    "Ghotki": {
        "name": "Ghotki",
        "province": "Sindh",
        "busStops": [
            { "name": "Ghotki Bus Terminal" },
            { "name": "Railway Station Bus Stop" },
            { "name": "Maroof Colony Bus Stop" },
            { "name": "Jarwar Road Bus Stop" },
            { "name": "Ubauro Adda Bus Stop" }
        ]
    },
    "Gujranwala": {
        "name": "Gujranwala",
        "province": "Punjab",
        "busStops": [
            { "name": "General Bus Stand Model Town" },
            { "name": "Daewoo Express Terminal" },
            { "name": "G.T. Road Bus Stop" },
            { "name": "Khayali Bypass Bus Stop" },
            { "name": "Rajput Travels Terminal" }
        ]
    },
    "Gujrat": {
        "name": "Gujrat",
        "province": "Punjab",
        "busStops": [
            { "name": "General Bus Stand" },
            { "name": "G.T. Road Bus Stop" },
            { "name": "University of Gujrat Bus Stop" },
            { "name": "Shadiwal Chowk Bus Stop" },
            { "name": "Railway Road Bus Stop" }
        ]
    },
    "Hyderabad": {
        "name": "Hyderabad",
        "province": "Sindh",
        "busStops": [
            { "name": "Hyderabad Bus Terminal" },
            { "name": "Latifabad Unit 7 Bus Stop" },
            { "name": "Qasimabad Bus Stop" },
            { "name": "Auto Bahn Road Bus Stop" },
            { "name": "Hala Naka Bus Stop" }
        ]
    },
    "Islamabad": {
        "name": "Islamabad",
        "province": "Islamabad Capital Territory",
        "busStops": [
            { "name": "Faizabad Bus Terminal" },
            { "name": "Pir Wadhai Bus Stand" },
            { "name": "Kashmir Highway Bus Stop" },
            { "name": "G-9 Markaz Bus Stop" },
            { "name": "Aabpara Market Bus Stop" }
        ]
    },
    "Jacobabad": {
        "name": "Jacobabad",
        "province": "Sindh",
        "busStops": [
            { "name": "Jacobabad Bus Terminal" },
            { "name": "Quetta Road Bus Stop" },
            { "name": "Railway Station Bus Stop" },
            { "name": "Civil Hospital Bus Stop" },
            { "name": "Thull Adda Bus Stop" }
        ]
    },
    "Jhelum": {
        "name": "Jhelum",
        "province": "Punjab",
        "busStops": [
            { "name": "Jhelum Bus Terminal" },
            { "name": "Civil Lines Bus Stop" },
            { "name": "Cantt Area Bus Stop" },
            { "name": "Machine Mohalla Bus Stop" },
            { "name": "Railway Road Bus Stop" }
        ]
    },
    "Karachi": {
        "name": "Karachi",
        "province": "Sindh",
        "busStops": [
            { "name": "Sohrab Goth Bus Terminal" },
            { "name": "Cantt Station Bus Stop" },
            { "name": "Korangi Bus Stop" },
            { "name": "Saddar Bus Stop" },
            { "name": "Gulshan-e-Iqbal Bus Stop" }
        ]
    },
    "Kasur": {
        "name": "Kasur",
        "province": "Punjab",
        "busStops": [
            { "name": "Kasur Bus Terminal" },
            { "name": "Railway Station Bus Stop" },
            { "name": "Chowk Fawara Bus Stop" },
            { "name": "Kot Radha Kishan Bus Stop" },
            { "name": "Kanganpur Adda Bus Stop" }
        ]
    },
    "Kohat": {
        "name": "Kohat",
        "province": "Khyber Pakhtunkhwa",
        "busStops": [
            { "name": "Kohat Bus Terminal" },
            { "name": "Pindi Road Bus Stop" },
            { "name": "Hangu Adda Bus Stop" },
            { "name": "KDA Bus Stop" },
            { "name": "University Road Bus Stop" }
        ]
    },
    "Lahore": {
        "name": "Lahore",
        "province": "Punjab",
        "busStops": [
            { "name": "Badami Bagh Bus Terminal" },
            { "name": "Thokar Niaz Baig Bus Stop" },
            { "name": "Kalma Chowk Bus Stop" },
            { "name": "Liberty Market Bus Stop" },
            { "name": "Ravi Road Bus Stop" }
        ]
    },
    "Larkana": {
        "name": "Larkana",
        "province": "Sindh",
        "busStops": [
            { "name": "Larkana Bus Terminal" },
            { "name": "Bakrani Road Bus Stop" },
            { "name": "Jinnah Bagh Bus Stop" },
            { "name": "Station Road Bus Stop" },
            { "name": "Ratodero Adda Bus Stop" }
        ]
    },
    "Mardan": {
        "name": "Mardan",
        "province": "Khyber Pakhtunkhwa",
        "busStops": [
            { "name": "Mardan General Bus Stand" },
            { "name": "Nowshera Road Bus Stop" },
            { "name": "Bagh-e-Aram Bus Stop" },
            { "name": "Sheikh Maltoon Town Bus Stop" },
            { "name": "Katlang Adda Bus Stop" }
        ]
    },
    "Mirpur": {
        "name": "Mirpur",
        "province": "Azad Jammu & Kashmir",
        "busStops": [
            { "name": "Mirpur Bus Terminal" },
            { "name": "Allama Iqbal Road Bus Stop" },
            { "name": "Sector F-1 Bus Stop" },
            { "name": "Chowk Shaheedan Bus Stop" },
            { "name": "Mangla Road Bus Stop" }
        ]
    },
    "Multan": {
        "name": "Multan",
        "province": "Punjab",
        "busStops": [
            { "name": "Lari Adda Bus Terminal" },
            { "name": "Vehari Chowk Bus Stop" },
            { "name": "Chowk Kumharanwala Bus Stop" },
            { "name": "Daewoo Express Bus Terminal" },
            { "name": "Bosan Road Bus Stop" }
        ]
    },
    "Muzaffarabad": {
        "name": "Muzaffarabad",
        "province": "Azad Jammu & Kashmir",
        "busStops": [
            { "name": "Muzaffarabad Bus Terminal" },
            { "name": "Neelum Road Bus Stop" },
            { "name": "Pir Chinasi Road Bus Stop" },
            { "name": "Secretariat Bus Stop" },
            { "name": "Chattar Domel Bus Stop" }
        ]
    },
    "Nawabshah": {
        "name": "Nawabshah",
        "province": "Sindh",
        "busStops": [
            { "name": "Nawabshah Bus Terminal" },
            { "name": "Sakrand Road Bus Stop" },
            { "name": "Hospital Road Bus Stop" },
            { "name": "Qazi Ahmed Road Bus Stop" },
            { "name": "Daur Adda Bus Stop" }
        ]
    },
    "Okara": {
        "name": "Okara",
        "province": "Punjab",
        "busStops": [
            { "name": "Okara General Bus Stand" },
            { "name": "Depalpur Chowk Bus Stop" },
            { "name": "Renala Khurd Adda Bus Stop" },
            { "name": "G.T. Road Bus Stop" },
            { "name": "University of Okara Bus Stop" }
        ]
    },
    "Peshawar": {
        "name": "Peshawar",
        "province": "Khyber Pakhtunkhwa",
        "busStops": [
            { "name": "Peshawar General Bus Stand" },
            { "name": "Haji Camp Bus Terminal" },
            { "name": "Kohat Road Bus Stop" },
            { "name": "University Road Bus Stop" },
            { "name": "Karkhano Market Bus Stop" }
        ]
    },
    "Quetta": {
        "name": "Quetta",
        "province": "Balochistan",
        "busStops": [
            { "name": "Quetta Bus Terminal" },
            { "name": "Kandahari Bazaar Bus Stop" },
            { "name": "Sariab Road Bus Stop" },
            { "name": "Spinny Road Bus Stop" },
            { "name": "Airport Road Bus Stop" }
        ]
    },
    "Rawalpindi": {
        "name": "Rawalpindi",
        "province": "Punjab",
        "busStops": [
            { "name": "Pir Wadhai Bus Terminal" },
            { "name": "Faizabad Bus Stop" },
            { "name": "Saddar Bus Stop" },
            { "name": "Committee Chowk Bus Stop" },
            { "name": "Murrir Hassan Bus Stop" }
        ]
    },
    "Sahiwal": {
        "name": "Sahiwal",
        "province": "Punjab",
        "busStops": [
            { "name": "Sahiwal General Bus Stand" },
            { "name": "Farid Town Bus Stop" },
            { "name": "G.T. Road Bus Stop" },
            { "name": "High Street Bus Stop" },
            { "name": "Noor Shah Adda Bus Stop" }
        ]
    },
    "Sargodha": {
        "name": "Sargodha",
        "province": "Punjab",
        "busStops": [
            { "name": "Sargodha General Bus Stand" },
            { "name": "University Road Bus Stop" },
            { "name": "Satellite Town Bus Stop" },
            { "name": "Lahore Road Bus Stop" },
            { "name": "Bhalwal Adda Bus Stop" }
        ]
    },
    "Sialkot": {
        "name": "Sialkot",
        "province": "Punjab",
        "busStops": [
            { "name": "Sialkot General Bus Stand" },
            { "name": "Allama Iqbal Chowk Bus Stop" },
            { "name": "Cantt Area Bus Stop" },
            { "name": "Ugoki Road Bus Stop" },
            { "name": "Daska Road Bus Stop" }
        ]
    },
    "Swabi": {
        "name": "Swabi",
        "province": "Khyber Pakhtunkhwa",
        "busStops": [
            { "name": "Swabi General Bus Stand" },
            { "name": "Shewa Adda Bus Stop" },
            { "name": "Topi Road Bus Stop" },
            { "name": "Gohati Bus Stop" },
            { "name": "Yar Hussain Adda Bus Stop" }
        ]
    },
    "Swat": {
        "name": "Swat",
        "province": "Khyber Pakhtunkhwa",
        "busStops": [
            { "name": "Mingora General Bus Stand" },
            { "name": "Saidu Sharif Bus Stop" },
            { "name": "Fizagat Bus Stop" },
            { "name": "Kabal Adda Bus Stop" },
            { "name": "Matta Bus Stop" }
        ]
    },
    "Turbat": {
        "name": "Turbat",
        "province": "Balochistan",
        "busStops": [
            { "name": "Turbat Bus Terminal" },
            { "name": "Main Bazaar Bus Stop" },
            { "name": "Airport Road Bus Stop" },
            { "name": "Absor Bus Stop" },
            { "name": "Shahi Tump Bus Stop" }
        ]
    },
    "Umarkot": {
        "name": "Umarkot",
        "province": "Sindh",
        "busStops": [
            { "name": "Umarkot Bus Terminal" },
            { "name": "Chhor Road Bus Stop" },
            { "name": "Kunri Adda Bus Stop" },
            { "name": "Shahi Bazaar Bus Stop" },
            { "name": "Dhoronaro Bus Stop" }
        ]
    },
    "Zhob": {
        "name": "Zhob",
        "province": "Balochistan",
        "busStops": [
            { "name": "Zhob Bus Terminal" },
            { "name": "Quetta Road Bus Stop" },
            { "name": "Babu China Bus Stop" },
            { "name": "Killi Appozai Bus Stop" },
            { "name": "Sheikh Manda Bus Stop" }
        ]
    }
}
  