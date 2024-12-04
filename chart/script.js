document.addEventListener('DOMContentLoaded', function() {
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const ctx = document.getElementById('inspectionChart').getContext('2d');
    let chart = null;

    // Fungsi untuk mengambil data dari server
    async function getData() {
        try {
            const response = await fetch('http://127.0.0.1:5000/info/get-history');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            filterData(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Fungsi untuk memfilter data berdasarkan tanggal
    function filterData(data) {
        const startDateValue = filterStartDate.value ? parseInt(filterStartDate.value.replace(/-/g, '')) : null;
        const endDateValue = filterEndDate.value ? parseInt(filterEndDate.value.replace(/-/g, '')) : null;

        const filteredData = data.filter(item => {
            return isDateInRange(item.inspection_date, startDateValue, endDateValue);
        });

        renderChart(filteredData);
    }

    // Fungsi untuk memeriksa apakah tanggal berada dalam rentang yang ditentukan
    function isDateInRange(date, startDate, endDate) {
        return (!startDate || date >= startDate) && (!endDate || date <= endDate);
    }

    // Fungsi untuk menghitung data OK dan NG berdasarkan waktu
    function calculateInspectionResults(data) {
        const okDay = data.filter(item => item.inspection_result === 'GOOD' && isDayTime(item.inspection_time)).length;
        const okNight = data.filter(item => item.inspection_result === 'GOOD' && !isDayTime(item.inspection_time)).length;
        const ngDay = data.filter(item => item.inspection_result === 'NG' && isDayTime(item.inspection_time)).length;
        const ngNight = data.filter(item => item.inspection_result === 'NG' && !isDayTime(item.inspection_time)).length;

        return { okDay, okNight, ngDay, ngNight };
    }

    // Fungsi untuk memeriksa apakah waktu adalah siang
    function isDayTime(time) {
        return time > 70000 && time < 200000;
    }

    // Fungsi untuk merender grafik menggunakan Chart.js
    function renderChart(data) {
        const { okDay, okNight, ngDay, ngNight } = calculateInspectionResults(data);

        const chartData = {
            labels: ['OK Day', 'OK Night', 'NG Day', 'NG Night'],
            datasets: [{
                label: 'Inspection Results',
                data: [okDay, okNight, ngDay, ngNight],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        };

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Event listeners untuk perubahan tanggal
    filterStartDate.addEventListener('change', () => getData());
    filterEndDate.addEventListener('change', () => getData());

    // Inisialisasi dengan mengambil data
    getData();
});